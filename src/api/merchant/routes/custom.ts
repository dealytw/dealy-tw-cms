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
    {
      method: 'GET',
      path: '/merchants/admin',
      handler: 'merchant.getAdminMerchants',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Add the missing admin endpoint that Coupon Editor expects
    {
      method: 'GET',
      path: '/api/merchants/admin',
      handler: 'merchant.getAdminMerchants',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
