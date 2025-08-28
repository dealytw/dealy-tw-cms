import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::rating.rating', ({ strapi }) => ({
  // Submit a new rating
  async submitRating(ctx) {
    try {
      const { 
        coupon_id, 
        merchant_id, 
        rating_type, 
        feedback_comment,
        coupon_uid,
        placement 
      } = ctx.request.body;

      // Validate required fields
      if (!coupon_id || !merchant_id || !rating_type) {
        return ctx.badRequest('Missing required fields: coupon_id, merchant_id, rating_type');
      }

      // Validate rating type
      if (!['thumbs_up', 'thumbs_down'].includes(rating_type)) {
        return ctx.badRequest('Invalid rating_type. Must be thumbs_up or thumbs_down');
      }

      // Get user IP and user agent
      const user_ip = ctx.request.ip || 'unknown';
      const user_agent = ctx.request.headers['user-agent'] || '';

      // Check if user already rated this coupon (by IP)
      const existingRating = await strapi.entityService.findMany('api::rating.rating', {
        filters: {
          coupon_id,
          user_ip,
          rating_type
        }
      });

      if (existingRating && existingRating.length > 0) {
        return ctx.badRequest('You have already rated this coupon');
      }

      // Create the rating
      const rating = await strapi.entityService.create('api::rating.rating', {
        data: {
          coupon_id,
          merchant_id,
          rating_type,
          user_ip,
          user_agent,
          feedback_comment: feedback_comment || '',
          coupon_uid: coupon_uid || '',
          placement: placement || ''
        }
      });

      // Get updated rating statistics
      const stats = await this.getRatingStats(ctx, coupon_id);

      return {
        success: true,
        message: 'Rating submitted successfully',
        rating,
        stats
      };

    } catch (error) {
      console.error('Error submitting rating:', error);
      return ctx.internalServerError('Failed to submit rating');
    }
  },

  // Get rating statistics for a coupon
  async getRatingStats(ctx) {
    try {
      const { coupon_id } = ctx.params;
      const ratings = await strapi.entityService.findMany('api::rating.rating', {
        filters: { coupon_id }
      });

      const thumbsUp = ratings.filter(r => (r as any).rating_type === 'thumbs_up').length;
      const thumbsDown = ratings.filter(r => (r as any).rating_type === 'thumbs_down').length;
      const total = ratings.length;

      return {
        coupon_id: coupon_id,
        thumbs_up: thumbsUp,
        thumbs_down: thumbsDown,
        total_ratings: total,
        success_rate: total > 0 ? Math.round((thumbsUp / total) * 100) : 0
      };

    } catch (error) {
      console.error('Error getting rating stats:', error);
      const { coupon_id } = ctx.params;
      return {
        coupon_id: coupon_id || 'unknown',
        thumbs_up: 0,
        thumbs_down: 0,
        total_ratings: 0,
        success_rate: 0
      };
    }
  },

  // Get rating statistics for a merchant
  async getMerchantRatingStats(ctx) {
    try {
      const { merchant_id } = ctx.params;

      const ratings = await strapi.entityService.findMany('api::rating.rating', {
        filters: { merchant_id }
      });

      const thumbsUp = ratings.filter(r => (r as any).rating_type === 'thumbs_up').length;
      const thumbsDown = ratings.filter(r => (r as any).rating_type === 'thumbs_down').length;
      const total = ratings.length;

      return {
        merchant_id,
        thumbs_up: thumbsUp,
        thumbs_down: thumbsDown,
        total_ratings: total,
        success_rate: total > 0 ? Math.round((thumbsUp / total) * 100) : 0
      };

    } catch (error) {
      console.error('Error getting merchant rating stats:', error);
      return ctx.internalServerError('Failed to get merchant rating stats');
    }
  },

  // Get recent ratings with feedback
  async getRecentRatings(ctx) {
    try {
      const { limit = 20 } = ctx.query;

      const ratings = await strapi.entityService.findMany('api::rating.rating', {
        filters: {
          feedback_comment: { $notNull: true }
        },
        sort: { createdAt: 'desc' },
        pagination: {
          limit: parseInt(limit as string)
        }
      });

      return ratings;

    } catch (error) {
      console.error('Error getting recent ratings:', error);
      return ctx.internalServerError('Failed to get recent ratings');
    }
  },

  // Get aggregated rating statistics
  async getAggregatedStats(ctx) {
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
  async getTopCoupons(ctx) {
    try {
      const { limit = 10 } = ctx.query;
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
        .slice(0, parseInt(limit as string));

      return topCoupons;

    } catch (error) {
      console.error('Error getting top coupons:', error);
      return [];
    }
  },

  // Get merchant performance rankings
  async getMerchantRankings(ctx) {
    try {
      const { limit = 20 } = ctx.query;
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
        .slice(0, parseInt(limit as string));

      return merchantRankings;

    } catch (error) {
      console.error('Error getting merchant rankings:', error);
      return [];
    }
  }
}));
