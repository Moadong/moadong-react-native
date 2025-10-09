import 'dotenv/config';

export default {
  expo: {
    name: 'moadong-app',
    slug: 'moadong-app',
    extra: {
      BASE_URL: process.env.BASE_URL,
    },
  },
};