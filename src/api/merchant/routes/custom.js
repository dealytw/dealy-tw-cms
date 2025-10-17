'use strict';

module.exports = {
  routes: [
    // DEBUG: prove the routes file is loaded
    {
      method: 'GET',
      path: '/merchants/:id/coupons/reorder-ping',
      handler: 'merchant.reorderPing',
      config: { auth: false },
    },
    // Your POST endpoint
    {
      method: 'POST',
      path: '/merchants/:id/coupons/reorder',
      handler: 'merchant.reorderCoupons',
      config: { auth: false }, // TEMP for testing; secure later
    },
  ],
};
