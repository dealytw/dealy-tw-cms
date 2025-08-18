export default {
  routes: [
    {
      method: 'POST',
      path: '/coupons/:id/click',
      handler: 'coupon.click',
      config: { auth: false }, // keep false if you’ll call from the public site
    },
    {
      method: 'POST',
      path: '/coupon/click',
      handler: 'coupon.clickByUid',
      config: { auth: false },
    },
  ],
};
