import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::rating.rating', ({ strapi }) => ({
  // Get aggregated rating statistics
  async getAggregatedStats() {
    try {
      const ratings = await strapi.entityService.findMany('api::rating.rating', {});

      const totalRatings = ratings.length;
      const thumbsUp = ratings.filter(r => (r as any).rating_type === 'thumbs_up').length;
      const thumbsDown = ratings.filter(r => (r as any).rating_type === 'thumbs_down').length;
      const overallSuccessRate = totalRatings > 0 ? Math.round((thumbsUp / totalRatings) * 100) : 0;

      // Get ratings by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRatings = ratings.filter(r => new Date((r as any).createdAt) > thirtyDaysAgo);
      const recentThumbsUp = recentRatings.filter(r => (r as any).rating_type === 'thumbs_up').length;
      const recentThumbsDown = recentRatings.filter(r => (r as any).rating_type === 'thumbs_down').length;
      const recentSuccessRate = recentRatings.length > 0 ? Math.round((recentThumbsUp / recentRatings.length) * 100) : 0;

      return {
        overall: {
          total_ratings: totalRatings,
          thumbs_up: thumbsUp,
          thumbs_down: thumbsDown,
          success_rate: overallSuccessRate
        },
        recent_30_days: {
          total_ratings: recentRatings.length,
          thumbs_up: recentThumbsUp,
          thumbs_down: recentThumbsDown,
          success_rate: recentSuccessRate
        }
      };

    } catch (error) {
      console.error('Error getting aggregated stats:', error);
      return {
        overall: { total_ratings: 0, thumbs_up: 0, thumbs_down: 0, success_rate: 0 },
        recent_30_days: { total_ratings: 0, thumbs_up: 0, thumbs_down: 0, success_rate: 0 }
      };
    }
  },

  // Get top performing coupons
  async getTopCoupons(limit = 10) {
    try {
      const ratings = await strapi.entityService.findMany('api::rating.rating', {});

      // Group ratings by coupon_id
      const couponStats: any = {};
      ratings.forEach(rating => {
        const r = rating as any;
        if (!couponStats[r.coupon_id]) {
          couponStats[r.coupon_id] = {
            coupon_id: r.coupon_id,
            merchant_id: r.merchant_id,
            thumbs_up: 0,
            thumbs_down: 0,
            total: 0
          };
        }
        
        if (r.rating_type === 'thumbs_up') {
          couponStats[r.coupon_id].thumbs_up++;
        } else {
          couponStats[r.coupon_id].thumbs_down++;
        }
        couponStats[r.coupon_id].total++;
      });

      // Calculate success rate and sort
      const topCoupons = Object.values(couponStats)
        .map((stats: any) => ({
          ...stats,
          success_rate: stats.total > 0 ? Math.round((stats.thumbs_up / stats.total) * 100) : 0
        }))
        .filter((stats: any) => stats.total >= 3) // Only show coupons with at least 3 ratings
        .sort((a: any, b: any) => b.success_rate - a.success_rate)
        .slice(0, limit);

      return topCoupons;

    } catch (error) {
      console.error('Error getting top coupons:', error);
      return [];
    }
  },

  // Get merchant performance rankings
  async getMerchantRankings(limit = 20) {
    try {
      const ratings = await strapi.entityService.findMany('api::rating.rating', {});

      // Group ratings by merchant_id
      const merchantStats: any = {};
      ratings.forEach(rating => {
        const r = rating as any;
        if (!merchantStats[r.merchant_id]) {
          merchantStats[r.merchant_id] = {
            merchant_id: r.merchant_id,
            thumbs_up: 0,
            thumbs_down: 0,
            total: 0
          };
        }
        
        if (r.rating_type === 'thumbs_up') {
          merchantStats[r.merchant_id].thumbs_up++;
        } else {
          merchantStats[r.merchant_id].thumbs_down++;
        }
        merchantStats[r.merchant_id].total++;
      });

      // Calculate success rate and sort
      const merchantRankings = Object.values(merchantStats)
        .map((stats: any) => ({
          ...stats,
          success_rate: stats.total > 0 ? Math.round((stats.thumbs_up / stats.total) * 100) : 0
        }))
        .filter((stats: any) => stats.total >= 5) // Only show merchants with at least 5 ratings
        .sort((a: any, b: any) => b.success_rate - a.success_rate)
        .slice(0, limit);

      return merchantRankings;

    } catch (error) {
      console.error('Error getting merchant rankings:', error);
      return [];
    }
  },

  // Check if user can rate (rate limiting)
  async canUserRate(coupon_id: string, user_ip: string) {
    try {
      // Check if user rated this coupon in the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const recentRating = await strapi.entityService.findMany('api::rating.rating', {
        filters: {
          coupon_id,
          user_ip,
          createdAt: { $gt: twentyFourHoursAgo.toISOString() }
        }
      });

      return recentRating.length === 0;

    } catch (error) {
      console.error('Error checking if user can rate:', error);
      return false;
    }
  }
}));
