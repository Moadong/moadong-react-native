#!/bin/sh

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/../.." && pwd)

cd "$REPO_ROOT"

prepend_homebrew_paths() {
  if [ -d /opt/homebrew/bin ]; then
    PATH="/opt/homebrew/bin:$PATH"
  fi

  if [ -d /usr/local/bin ]; then
    PATH="/usr/local/bin:$PATH"
  fi

  export PATH
}

install_with_homebrew() {
  FORMULA="$1"

  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew is required to install $FORMULA, but brew is not available." >&2
    exit 1
  fi

  if ! brew list "$FORMULA" >/dev/null 2>&1; then
    brew install "$FORMULA"
  fi
}

ensure_node() {
  prepend_homebrew_paths

  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    export NODE_BINARY="$(command -v node)"
    return
  fi

  NODE_FORMULA="${NODE_FORMULA:-node@22}"

  echo "Node.js/npm not found in PATH. Installing $NODE_FORMULA with Homebrew..."
  install_with_homebrew "$NODE_FORMULA"

  NODE_PREFIX="$(brew --prefix "$NODE_FORMULA" 2>/dev/null || true)"
  if [ -n "$NODE_PREFIX" ]; then
    PATH="$NODE_PREFIX/bin:$PATH"
    export PATH
  fi

  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "Failed to make Node.js/npm available after installing $NODE_FORMULA." >&2
    exit 1
  fi

  export NODE_BINARY="$(command -v node)"
}

RUBY_VERSION_SERIES="$(awk -F. '{ print $1 "." $2 }' .ruby-version)"
RUBY_FORMULA="${RUBY_FORMULA:-ruby@${RUBY_VERSION_SERIES}}"

prepend_homebrew_ruby_path() {
  if ! command -v brew >/dev/null 2>&1; then
    return
  fi

  RUBY_PREFIX="$(brew --prefix "$RUBY_FORMULA" 2>/dev/null || true)"
  if [ -n "$RUBY_PREFIX" ]; then
    PATH="$RUBY_PREFIX/bin:$PATH"
    export PATH
  fi
}

ruby_is_supported() {
  command -v ruby >/dev/null 2>&1 &&
    [ "$(ruby -e 'print RUBY_VERSION.split(".").first(2).join(".")')" = "$RUBY_VERSION_SERIES" ]
}

ensure_ruby() {
  prepend_homebrew_paths
  prepend_homebrew_ruby_path

  if ruby_is_supported; then
    return
  fi

  echo "Ruby $RUBY_VERSION_SERIES not found in PATH. Installing $RUBY_FORMULA with Homebrew..."
  install_with_homebrew "$RUBY_FORMULA"
  prepend_homebrew_ruby_path

  if ! ruby_is_supported; then
    echo "Failed to make Ruby $RUBY_VERSION_SERIES available." >&2
    exit 1
  fi
}

BUNDLER_VERSION="${BUNDLER_VERSION:-2.5.22}"

ensure_bundler() {
  if gem list --installed bundler --version "$BUNDLER_VERSION" >/dev/null 2>&1; then
    return
  fi

  echo "Installing Bundler $BUNDLER_VERSION..."
  gem install bundler -v "$BUNDLER_VERSION" --no-document
}

ensure_node
ensure_ruby
ensure_bundler
node --version
npm --version
ruby --version
bundle "_${BUNDLER_VERSION}_" --version
npm ci

bundle "_${BUNDLER_VERSION}_" install --jobs 4 --retry 3

decode_google_service_info_plist() {
  if printf '%s' "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | base64 --decode > GoogleService-Info.plist 2>/dev/null; then
    return
  fi

  if printf '%s' "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | base64 -D > GoogleService-Info.plist 2>/dev/null; then
    return
  fi

  if command -v openssl >/dev/null 2>&1 &&
    printf '%s' "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | openssl base64 -d -A > GoogleService-Info.plist 2>/dev/null; then
    return
  fi

  echo "Failed to decode GOOGLE_SERVICE_INFO_PLIST_BASE64" >&2
  exit 1
}

if [ -n "${GOOGLE_SERVICE_INFO_PLIST_BASE64:-}" ]; then
  decode_google_service_info_plist
elif [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  printf '%s' "$GOOGLE_SERVICE_INFO_PLIST" > GoogleService-Info.plist
else
  echo "Missing GOOGLE_SERVICE_INFO_PLIST_BASE64 or GOOGLE_SERVICE_INFO_PLIST for iOS archive" >&2
  exit 1
fi

mkdir -p ios/app
cp GoogleService-Info.plist ios/app/GoogleService-Info.plist

: "${EXPO_PUBLIC_BASE_URL:?Missing EXPO_PUBLIC_BASE_URL for iOS archive}"
: "${EXPO_PUBLIC_WEBVIEW_URL:?Missing EXPO_PUBLIC_WEBVIEW_URL for iOS archive}"
: "${EXPO_PUBLIC_MIXPANEL_TOKEN:?Missing EXPO_PUBLIC_MIXPANEL_TOKEN for iOS archive}"

{
  echo "EXPO_PUBLIC_BASE_URL=${EXPO_PUBLIC_BASE_URL}"
  echo "EXPO_PUBLIC_WEBVIEW_URL=${EXPO_PUBLIC_WEBVIEW_URL}"
  echo "EXPO_PUBLIC_MIXPANEL_TOKEN=${EXPO_PUBLIC_MIXPANEL_TOKEN}"
} > .env

APS_ENVIRONMENT="${IOS_APS_ENVIRONMENT:-development}"
ENTITLEMENTS_FILE="${IOS_ENTITLEMENTS_FILE:-ios/app/app.entitlements}"

if [ -f "$ENTITLEMENTS_FILE" ]; then
  /usr/libexec/PlistBuddy -c "Set :aps-environment $APS_ENVIRONMENT" "$ENTITLEMENTS_FILE" 2>/dev/null ||
    /usr/libexec/PlistBuddy -c "Add :aps-environment string $APS_ENVIRONMENT" "$ENTITLEMENTS_FILE"
fi

cd ios
bundle "_${BUNDLER_VERSION}_" exec pod install --deployment

PODS_RELEASE_XCCONFIG="Pods/Target Support Files/Pods-app/Pods-app.release.xcconfig"
if [ ! -f "$PODS_RELEASE_XCCONFIG" ]; then
  echo "Missing $PODS_RELEASE_XCCONFIG after pod install. Xcode archive cannot continue without CocoaPods base configuration." >&2
  exit 1
fi
