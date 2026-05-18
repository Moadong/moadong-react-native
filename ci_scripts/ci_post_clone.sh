#!/bin/sh

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
REPO_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

cd "$REPO_ROOT"

npm ci

if [ -n "${GOOGLE_SERVICE_INFO_PLIST_BASE64:-}" ]; then
  printf '%s' "$GOOGLE_SERVICE_INFO_PLIST_BASE64" | base64 --decode > GoogleService-Info.plist
elif [ -n "${GOOGLE_SERVICE_INFO_PLIST:-}" ]; then
  printf '%s' "$GOOGLE_SERVICE_INFO_PLIST" > GoogleService-Info.plist
fi

APS_ENVIRONMENT="${IOS_APS_ENVIRONMENT:-development}"
ENTITLEMENTS_FILE="${IOS_ENTITLEMENTS_FILE:-ios/app/app.entitlements}"

if [ -f "$ENTITLEMENTS_FILE" ]; then
  /usr/libexec/PlistBuddy -c "Set :aps-environment $APS_ENVIRONMENT" "$ENTITLEMENTS_FILE" 2>/dev/null ||
    /usr/libexec/PlistBuddy -c "Add :aps-environment string $APS_ENVIRONMENT" "$ENTITLEMENTS_FILE"
fi

cd ios
pod install
