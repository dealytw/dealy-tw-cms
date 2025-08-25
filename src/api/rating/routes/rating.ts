export default {
  routes: [
    // Submit a new rating
    {
      method: 'POST',
      path: '/ratings/submit',
      handler: 'rating.submitRating',
      config: {
        auth: false, // Allow anonymous ratings
        policies: [],
        middlewares: [],
      },
    },
    // Get rating statistics for a coupon
    {
      method: 'GET',
      path: '/ratings/stats/coupon/:coupon_id',
      handler: 'rating.getRatingStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Get rating statistics for a merchant
    {
      method: 'GET',
      path: '/ratings/stats/merchant/:merchant_id',
      handler: 'rating.getMerchantRatingStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Get recent ratings with feedback
    {
      method: 'GET',
      path: '/ratings/recent',
      handler: 'rating.getRecentRatings',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Get aggregated statistics
    {
      method: 'GET',
      path: '/ratings/aggregated',
      handler: 'rating.getAggregatedStats',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Get top performing coupons
    {
      method: 'GET',
      path: '/ratings/top-coupons',
      handler: 'rating.getTopCoupons',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    // Get merchant rankings
    {
      method: 'GET',
      path: '/ratings/merchant-rankings',
      handler: 'rating.getMerchantRankings',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    }
  ],
};
