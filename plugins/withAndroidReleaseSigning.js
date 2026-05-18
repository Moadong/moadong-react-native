const { withAppBuildGradle } = require('@expo/config-plugins');

const RELEASE_SIGNING_CONFIG = `        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }`;

const SIGNING_CONFIGS_BLOCK = `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }

${RELEASE_SIGNING_CONFIG}
    }`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function findBlock(source, name, fromIndex = 0) {
  const pattern = new RegExp(`\\b${escapeRegExp(name)}\\s*\\{`, 'g');
  pattern.lastIndex = fromIndex;

  const match = pattern.exec(source);
  if (!match) {
    return null;
  }

  const openBraceIndex = source.indexOf('{', match.index);
  let depth = 0;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    const character = source[index];

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
    }

    if (depth === 0) {
      return {
        start: match.index,
        openBraceIndex,
        closeBraceIndex: index,
        end: index + 1,
      };
    }
  }

  return null;
}

function insertBeforeBlockClose(source, block, content) {
  const closingLineStart = source.lastIndexOf('\n', block.closeBraceIndex) + 1;
  return `${source.slice(0, closingLineStart)}${content}\n${source.slice(closingLineStart)}`;
}

function ensureReleaseSigningConfig(source, androidBlock) {
  const signingConfigs = findBlock(source, 'signingConfigs', androidBlock.openBraceIndex);

  if (!signingConfigs || signingConfigs.start > androidBlock.closeBraceIndex) {
    const defaultConfig = findBlock(source, 'defaultConfig', androidBlock.openBraceIndex);
    if (!defaultConfig || defaultConfig.start > androidBlock.closeBraceIndex) {
      return insertBeforeBlockClose(source, androidBlock, SIGNING_CONFIGS_BLOCK);
    }

    return `${source.slice(0, defaultConfig.end)}\n${SIGNING_CONFIGS_BLOCK}\n${source.slice(defaultConfig.end)}`;
  }

  const releaseSigningConfig = findBlock(source, 'release', signingConfigs.openBraceIndex);

  if (
    releaseSigningConfig &&
    releaseSigningConfig.start < signingConfigs.closeBraceIndex &&
    source.slice(releaseSigningConfig.start, releaseSigningConfig.end).includes('MYAPP_UPLOAD_STORE_FILE')
  ) {
    return source;
  }

  if (releaseSigningConfig && releaseSigningConfig.start < signingConfigs.closeBraceIndex) {
    return `${source.slice(0, releaseSigningConfig.start)}${RELEASE_SIGNING_CONFIG}${source.slice(
      releaseSigningConfig.end
    )}`;
  }

  return insertBeforeBlockClose(source, signingConfigs, RELEASE_SIGNING_CONFIG);
}

function ensureReleaseBuildTypeUsesSigningConfig(source, androidBlock) {
  const buildTypes = findBlock(source, 'buildTypes', androidBlock.openBraceIndex);
  if (!buildTypes || buildTypes.start > androidBlock.closeBraceIndex) {
    return source;
  }

  const releaseBuildType = findBlock(source, 'release', buildTypes.openBraceIndex);
  if (!releaseBuildType || releaseBuildType.start > buildTypes.closeBraceIndex) {
    return source;
  }

  const releaseBlock = source.slice(releaseBuildType.start, releaseBuildType.end);

  if (releaseBlock.includes('signingConfig signingConfigs.release')) {
    return source;
  }

  if (releaseBlock.includes('signingConfig signingConfigs.debug')) {
    return `${source.slice(0, releaseBuildType.start)}${releaseBlock.replace(
      'signingConfig signingConfigs.debug',
      'signingConfig signingConfigs.release'
    )}${source.slice(releaseBuildType.end)}`;
  }

  const insertionPoint = releaseBuildType.openBraceIndex + 1;
  return `${source.slice(0, insertionPoint)}\n            signingConfig signingConfigs.release${source.slice(
    insertionPoint
  )}`;
}

function addAndroidReleaseSigning(source) {
  const androidBlock = findBlock(source, 'android');
  if (!androidBlock) {
    return source;
  }

  const withSigningConfig = ensureReleaseSigningConfig(source, androidBlock);
  const updatedAndroidBlock = findBlock(withSigningConfig, 'android');

  return ensureReleaseBuildTypeUsesSigningConfig(withSigningConfig, updatedAndroidBlock);
}

module.exports = function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents = addAndroidReleaseSigning(config.modResults.contents);
    return config;
  });
};
