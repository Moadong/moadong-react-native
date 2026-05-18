const appJson = require('./app.json');

const getApsEnvironment = () =>
  process.env.IOS_APS_ENVIRONMENT === 'production' ? 'production' : 'development';

module.exports = () => {
  const expo = appJson.expo;

  return {
    ...expo,
    ios: {
      ...expo.ios,
      entitlements: {
        ...(expo.ios?.entitlements ?? {}),
        'aps-environment': getApsEnvironment(),
      },
    },
  };
};
