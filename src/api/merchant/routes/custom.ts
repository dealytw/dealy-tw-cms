/**
 * Custom merchant routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/merchants/:id/seo-schema',
      handler: 'merchant.getSeoSchema',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
