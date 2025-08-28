export default {
  routes: [
    {
      method: 'GET',
      path: '/coupons',
      handler: 'coupons.find',
      config: {
        auth: false, // Allow public access for now
      },
    },
    {
      method: 'GET',
      path: '/coupons/:id',
      handler: 'coupons.findOne',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/coupons',
      handler: 'coupons.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/coupons/:id',
      handler: 'coupons.update',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/coupons/:id',
      handler: 'coupons.delete',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/coupons/search',
      handler: 'coupons.search',
      config: {
        auth: false,
      },
    },
  ],
};
