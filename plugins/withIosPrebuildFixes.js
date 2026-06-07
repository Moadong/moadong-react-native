const fs = require('fs');
const path = require('path');
const { withFinalizedMod, withPodfile, withXcodeProject } = require('@expo/config-plugins');

const SUPPORT_DIR = path.join(__dirname, 'ios-prebuild-support');

const RNFB_SCRIPT_PHASE_NAMES = new Set([
  '[CP-User] [RNFB] Core Configuration',
  '[CP-User] [RNFB] Crashlytics Configuration',
]);

const RNFB_PODFILE_BLOCK = `RNFB_SCRIPT_PHASES = [
  '[CP-User] [RNFB] Core Configuration',
  '[CP-User] [RNFB] Crashlytics Configuration',
].freeze

def configure_rnfb_script_phases(installer)
  installer.aggregate_targets.each do |aggregate_target|
    project = aggregate_target.user_project
    next unless project

    updated = false

    project.targets.each do |target|
      next unless target.respond_to?(:shell_script_build_phases)

      target.shell_script_build_phases.each do |phase|
        next unless RNFB_SCRIPT_PHASES.include?(phase.name)

        phase.always_out_of_date = '1'
        updated = true
      end
    end

    project.save if updated
  end
end
`;

const PODFILE_BUILD_FIXES_BLOCK = `def set_xcconfig_build_setting(path, key, value)
  return unless path && File.exist?(path)

  contents = File.read(path)
  setting = "#{key} = #{value}"

  updated_contents =
    if contents.match?(/^#{Regexp.escape(key)}\\s*=/)
      contents.gsub(/^#{Regexp.escape(key)}\\s*=.*$/, setting)
    else
      "#{setting}\\n#{contents}"
    end

  File.write(path, updated_contents) if updated_contents != contents
end

def configure_fmt_for_xcode_26(installer)
  fmt_target = installer.pods_project.targets.find { |target| target.name == 'fmt' }
  return unless fmt_target

  fmt_target.build_configurations.each do |config|
    config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
    set_xcconfig_build_setting(
      config.base_configuration_reference&.real_path,
      'CLANG_CXX_LANGUAGE_STANDARD',
      'c++17'
    )
  end
end

def normalize_pods_deployment_target(installer, deployment_target)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = deployment_target
    end
  end
end
`;

const CCACHE_FUNCTION_END = `  podfile_properties['apple.ccacheEnabled'] == 'true'
end

`;

const GENERATED_PLATFORM_LINE = "platform :ios, podfile_properties['ios.deploymentTarget'] || '15.1'";
const DEPLOYMENT_TARGET_LINES = `ios_deployment_target = podfile_properties['ios.deploymentTarget'] || '15.1'
platform :ios, ios_deployment_target`;

const POST_INSTALL_ANCHOR = `    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
      :ccache_enabled => ccache_enabled?(podfile_properties),
    )`;

const POST_INSTALL_FIXES = `${POST_INSTALL_ANCHOR}

    configure_fmt_for_xcode_26(installer)
    normalize_pods_deployment_target(installer, ios_deployment_target)`;

const POST_INTEGRATE_BLOCK = `post_integrate do |installer|
  configure_rnfb_script_phases(installer)
end
`;

function insertAfter(source, anchor, insertion) {
  if (!source.includes(anchor)) {
    throw new Error(`Unable to find expected Podfile anchor: ${anchor.split('\n')[0]}`);
  }

  return source.replace(anchor, `${anchor}${insertion}`);
}

function applyPodfileFixes(source) {
  let contents = source;

  if (!contents.includes('RNFB_SCRIPT_PHASES = [')) {
    contents = insertAfter(contents, CCACHE_FUNCTION_END, `${RNFB_PODFILE_BLOCK}\n`);
  }

  if (!contents.includes(DEPLOYMENT_TARGET_LINES)) {
    contents = contents.replace(GENERATED_PLATFORM_LINE, DEPLOYMENT_TARGET_LINES);
  }

  if (!contents.includes('def configure_fmt_for_xcode_26(installer)')) {
    contents = insertAfter(contents, `${DEPLOYMENT_TARGET_LINES}\n\n`, `${PODFILE_BUILD_FIXES_BLOCK}\n`);
  }

  if (!contents.includes('    configure_fmt_for_xcode_26(installer)')) {
    contents = contents.replace(POST_INSTALL_ANCHOR, POST_INSTALL_FIXES);
  }

  if (!contents.includes('post_integrate do |installer|')) {
    contents = `${contents.trimEnd()}\n\n${POST_INTEGRATE_BLOCK}`;
  }

  return contents;
}

function normalizeXcodeString(value) {
  return String(value || '')
    .replace(/^"/, '')
    .replace(/"$/, '')
    .replace(/\\"/g, '"');
}

function applyXcodeProjectFixes(project) {
  const shellScriptBuildPhases = project.hash?.project?.objects?.PBXShellScriptBuildPhase;

  for (const phase of Object.values(shellScriptBuildPhases || {})) {
    if (!phase || typeof phase !== 'object' || phase.isa !== 'PBXShellScriptBuildPhase') {
      continue;
    }

    const phaseName = normalizeXcodeString(phase.name);
    if (RNFB_SCRIPT_PHASE_NAMES.has(phaseName)) {
      phase.alwaysOutOfDate = 1;
    }
  }

  return project;
}

function copySupportFile(sourceName, destinationPath, mode) {
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(path.join(SUPPORT_DIR, sourceName), destinationPath);

  if (mode) {
    fs.chmodSync(destinationPath, mode);
  }
}

function removeAppTestsFromScheme(schemeContents) {
  return schemeContents.replace(/\n\s*<TestableReference\b[\s\S]*?<\/TestableReference>/g, (block) => {
    if (block.includes('BuildableName = "appTests.xctest"') || block.includes('BlueprintName = "appTests"')) {
      return '';
    }

    return block;
  });
}

function applyFinalizedFileFixes(platformProjectRoot) {
  copySupportFile('xcode.env', path.join(platformProjectRoot, '.xcode.env'));
  copySupportFile('ci_post_clone.sh', path.join(platformProjectRoot, 'ci_scripts', 'ci_post_clone.sh'), 0o755);
  copySupportFile(
    'IDEWorkspaceChecks.plist',
    path.join(platformProjectRoot, 'app.xcworkspace', 'xcshareddata', 'IDEWorkspaceChecks.plist')
  );

  const schemePath = path.join(platformProjectRoot, 'app.xcodeproj', 'xcshareddata', 'xcschemes', 'app.xcscheme');
  if (fs.existsSync(schemePath)) {
    const schemeContents = fs.readFileSync(schemePath, 'utf8');
    fs.writeFileSync(schemePath, removeAppTestsFromScheme(schemeContents), 'utf8');
  }
}

module.exports = function withIosPrebuildFixes(config) {
  config = withPodfile(config, (config) => {
    config.modResults.contents = applyPodfileFixes(config.modResults.contents);
    return config;
  });

  config = withXcodeProject(config, (config) => {
    config.modResults = applyXcodeProjectFixes(config.modResults);
    return config;
  });

  return withFinalizedMod(config, [
    'ios',
    (config) => {
      applyFinalizedFileFixes(config.modRequest.platformProjectRoot);
      return config;
    },
  ]);
};
