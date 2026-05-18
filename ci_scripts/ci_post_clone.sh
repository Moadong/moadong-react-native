#!/bin/sh

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$REPO_ROOT"

npm ci

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
pod install --deployment

PODS_RELEASE_XCCONFIG="Pods/Target Support Files/Pods-app/Pods-app.release.xcconfig"
if [ ! -f "$PODS_RELEASE_XCCONFIG" ]; then
  echo "Missing $PODS_RELEASE_XCCONFIG after pod install. Xcode archive cannot continue without CocoaPods base configuration." >&2
  exit 1
fi
