const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins');

/**
 * Fix manifest merger conflict with react-native-firebase/messaging:
 * - com.google.firebase.messaging.default_notification_color
 *
 * Ensures our app's value wins by setting:
 * - xmlns:tools on <manifest>
 * - tools:replace="android:resource" on the meta-data element
 */
module.exports = function withFcmNotificationColorFix(config) {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    androidManifest.manifest.$ = androidManifest.manifest.$ || {};
    androidManifest.manifest.$['xmlns:tools'] =
      androidManifest.manifest.$['xmlns:tools'] || 'http://schemas.android.com/tools';

    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
    application['meta-data'] = application['meta-data'] || [];

    const metaDataName = 'com.google.firebase.messaging.default_notification_color';
    let node = application['meta-data'].find((m) => m?.$?.['android:name'] === metaDataName);

    if (!node) {
      node = { $: { 'android:name': metaDataName } };
      application['meta-data'].push(node);
    }

    node.$['android:resource'] = '@color/notification_icon_color';
    node.$['tools:replace'] = 'android:resource';

    return config;
  });
};

