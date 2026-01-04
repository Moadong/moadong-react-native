module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
    },
  };
};
