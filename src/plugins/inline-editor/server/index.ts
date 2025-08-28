export default ({ strapi }: any) => ({
  register({ strapi }: any) {
    // Server-side plugin registration
    strapi.log.info('Coupon Editor plugin loaded on server side');
  },

  bootstrap({ strapi }: any) {
    // Server-side plugin initialization
  },

  destroy({ strapi }: any) {
    // Cleanup when plugin is destroyed
  },

  config: {
    default: {},
    validator() {},
  },

  controllers: {
    index: require('./controllers/index').default,
  },

  routes: require('./routes/index').default,
});
