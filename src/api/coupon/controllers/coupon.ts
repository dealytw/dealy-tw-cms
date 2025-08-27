/**
 * coupon controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::coupon.coupon', ({ strapi }) => ({
  async getAdminCoupons(ctx) {
    try {
      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        populate: {
          merchant: {
            fields: ['id', 'merchant_name', 'slug']
          }
        },
        sort: { priority: 'desc', createdAt: 'desc' },
        limit: 1000
      });
      
      // Format the data to match what the Coupon Editor expects
      const formattedCoupons = coupons.map((coupon: any) => {
        const couponData = coupon as any;
        return {
          ...couponData,
          // Ensure merchant data is properly structured
          merchant: couponData.merchant ? {
            id: couponData.merchant.id,
            merchant_name: couponData.merchant.merchant_name,
            slug: couponData.merchant.slug
          } : null
        };
      });
      
      ctx.body = { results: formattedCoupons };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async getAdminMerchants(ctx) {
    try {
      const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
        fields: ['id', 'merchant_name', 'slug'],
        limit: 1000
      });
      
      ctx.body = { results: merchants };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async createCoupon(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Create the coupon using entityService
      const coupon = await strapi.entityService.create('api::coupon.coupon', {
        data: data
      });
      
      ctx.body = { data: coupon };
    } catch (error) {
      console.error('Error creating coupon:', error);
      ctx.throw(500, error);
    }
  },

  async updateCoupon(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      
      // Update the coupon using entityService
      const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', id, {
        data: data
      });
      
      ctx.body = { data: updatedCoupon };
    } catch (error) {
      console.error('Error updating coupon:', error);
      ctx.throw(500, error);
    }
  },

  // Track coupon usage (clicks)
  async trackUsage(ctx) {
    try {
      const { coupon_id } = ctx.params;
      const user_ip = ctx.request.ip || 'unknown';
      const user_agent = ctx.request.headers['user-agent'] || '';

      const coupon = await strapi.entityService.findOne('api::coupon.coupon', coupon_id, {
        fields: ['id', 'user_count', 'last_click_at']
      });

      if (!coupon) {
        return ctx.notFound('Coupon not found');
      }

      const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', coupon_id, {
        data: {
          user_count: (coupon.user_count || 0) + 1,
          last_click_at: new Date().toISOString()
        }
      });

      strapi.log.info(`Coupon ${coupon_id} clicked by IP: ${user_ip}`);

      return {
        success: true,
        message: 'Usage tracked successfully',
        coupon: updatedCoupon
      };

    } catch (error) {
      console.error('Error tracking coupon usage:', error);
      return ctx.internalServerError('Failed to track usage');
    }
  },

  // Get coupons by approval status
  async getCouponsByApprovalStatus(ctx) {
    try {
      const { status = 'pending_review', page = 1, pageSize = 20 } = ctx.query;
      
      const filters: any = { approval_status: status };
      
      if (status === 'draft') {
        filters.publishedAt = { $null: true };
      }
      
      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        filters,
        populate: ['merchant'],
        sort: { createdAt: 'desc' },
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });
      
      ctx.body = { results: coupons };
    } catch (error) {
      console.error('Error getting coupons by approval status:', error);
      ctx.throw(500, error);
    }
  },

  // Bulk approve coupons
  async bulkApprove(ctx) {
    try {
      const { coupon_ids, reviewer_notes } = ctx.request.body;
      
      if (!coupon_ids || !Array.isArray(coupon_ids) || coupon_ids.length === 0) {
        return ctx.badRequest('coupon_ids array is required');
      }

      const results = [];
      
      for (const couponId of coupon_ids) {
        try {
          const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', couponId, {
            data: {
              approval_status: 'approved',
              reviewer_notes: reviewer_notes || '',
              publishedAt: new Date().toISOString()
            }
          });
          
          results.push({
            id: couponId,
            success: true,
            data: updatedCoupon
          });
        } catch (error) {
          results.push({
            id: couponId,
            success: false,
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return {
        success: true,
        message: `Bulk approval completed. ${successCount} approved, ${failureCount} failed.`,
        results,
        summary: {
          total: coupon_ids.length,
          successful: successCount,
          failed: failureCount
        }
      };
      
    } catch (error) {
      console.error('Error in bulk approval:', error);
      return ctx.internalServerError('Failed to process bulk approval');
    }
  },

  // Bulk reject coupons
  async bulkReject(ctx) {
    try {
      const { coupon_ids, reviewer_notes } = ctx.request.body;
      
      if (!coupon_ids || !Array.isArray(coupon_ids) || coupon_ids.length === 0) {
        return ctx.badRequest('coupon_ids array is required');
      }

      if (!reviewer_notes) {
        return ctx.badRequest('reviewer_notes is required for rejection');
      }

      const results = [];
      
      for (const couponId of coupon_ids) {
        try {
          const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', couponId, {
            data: {
              approval_status: 'rejected',
              reviewer_notes,
              publishedAt: null // Unpublish rejected coupons
            }
          });
          
          results.push({
            id: couponId,
            success: true,
            data: updatedCoupon
          });
        } catch (error) {
          results.push({
            id: couponId,
            success: false,
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      return {
        success: true,
        message: `Bulk rejection completed. ${successCount} rejected, ${failureCount} failed.`,
        results,
        summary: {
          total: coupon_ids.length,
          successful: successCount,
          failed: failureCount
        }
      };
      
    } catch (error) {
      console.error('Error in bulk rejection:', error);
      return ctx.internalServerError('Failed to process bulk rejection');
    }
  },

  // Schedule coupon publication
  async schedulePublication(ctx) {
    try {
      const { id } = ctx.params;
      const { scheduled_publish_date, approval_status = 'approved' } = ctx.request.body;
      
      if (!scheduled_publish_date) {
        return ctx.badRequest('scheduled_publish_date is required');
      }

      const scheduledDate = new Date(scheduled_publish_date);
      if (isNaN(scheduledDate.getTime())) {
        return ctx.badRequest('Invalid scheduled_publish_date format');
      }

      const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', id, {
        data: {
          approval_status,
          scheduled_publish_date: scheduledDate.toISOString(),
          publishedAt: null // Will be set when scheduled date arrives
        }
      });
      
      return {
        success: true,
        message: 'Coupon scheduled for publication',
        coupon: updatedCoupon
      };
      
    } catch (error) {
      console.error('Error scheduling publication:', error);
      return ctx.internalServerError('Failed to schedule publication');
    }
  },

  // Get AI-generated coupons for review
  async getAIGeneratedCoupons(ctx) {
    try {
      const { page = 1, pageSize = 20 } = ctx.query;
      
      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: { 
          ai_generated: true,
          approval_status: { $in: ['draft', 'pending_review'] }
        },
        populate: ['merchant'],
        sort: { createdAt: 'desc' },
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string)
        }
      });
      
      ctx.body = { results: coupons };
    } catch (error) {
      console.error('Error getting AI-generated coupons:', error);
      ctx.throw(500, error);
    }
  },

  // Track affiliate conversion
  async trackAffiliateConversion(ctx) {
    try {
      const { coupon_id, conversion_type, revenue, user_data } = ctx.request.body;
      
      if (!coupon_id || !conversion_type) {
        return ctx.badRequest('coupon_id and conversion_type are required');
      }

      const coupon = await strapi.entityService.findOne('api::coupon.coupon', coupon_id, {
        fields: ['id', 'conversion_count', 'revenue_generated', 'commission_rate', 'affiliate_id']
      });

      if (!coupon) {
        return ctx.notFound('Coupon not found');
      }

      // Update conversion count and revenue
      const updateData: any = {
        conversion_count: (coupon.conversion_count || 0) + 1
      };

      if (revenue && typeof revenue === 'number') {
        updateData.revenue_generated = (coupon.revenue_generated || 0) + revenue;
      }

      const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', coupon_id, {
        data: updateData
      });

      // Log conversion for analytics
      strapi.log.info(`Affiliate conversion tracked for coupon ${coupon_id}: ${conversion_type}, Revenue: ${revenue || 0}`);

      return {
        success: true,
        message: 'Conversion tracked successfully',
        conversion: {
          coupon_id,
          conversion_type,
          revenue: revenue || 0,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error tracking affiliate conversion:', error);
      return ctx.internalServerError('Failed to track conversion');
    }
  },

  // Get affiliate performance statistics
  async getAffiliateStats(ctx) {
    try {
      const { start_date, end_date, affiliate_id } = ctx.query;
      
      const filters: any = {};
      
      if (start_date && end_date) {
        filters.createdAt = {
          $gte: new Date(start_date as string),
          $lte: new Date(end_date as string)
        };
      }
      
      if (affiliate_id) {
        filters.affiliate_id = affiliate_id;
      }

      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        filters,
        fields: ['id', 'conversion_count', 'revenue_generated', 'commission_rate', 'affiliate_id', 'createdAt']
      });

      // Calculate statistics
      const totalConversions = coupons.reduce((sum, coupon) => sum + (coupon.conversion_count || 0), 0);
      const totalRevenue = coupons.reduce((sum, coupon) => sum + (coupon.revenue_generated || 0), 0);
      const totalCommissions = coupons.reduce((sum, coupon) => {
        const commission = (coupon.revenue_generated || 0) * (coupon.commission_rate || 0) / 100;
        return sum + commission;
      }, 0);

      const stats = {
        total_coupons: coupons.length,
        total_conversions: totalConversions,
        total_revenue: totalRevenue,
        total_commissions: totalCommissions,
        average_conversion_rate: coupons.length > 0 ? totalConversions / coupons.length : 0,
        period: {
          start: start_date || 'all',
          end: end_date || 'all'
        }
      };

      return { results: stats };

    } catch (error) {
      console.error('Error getting affiliate stats:', error);
      ctx.throw(500, error);
    }
  },

  // Generate affiliate tracking link
  async generateAffiliateLink(ctx) {
    try {
      const { coupon_id, affiliate_id, tracking_code } = ctx.request.body;
      
      if (!coupon_id || !affiliate_id) {
        return ctx.badRequest('coupon_id and affiliate_id are required');
      }

      const coupon = await strapi.entityService.findOne('api::coupon.coupon', coupon_id, {
        fields: ['id', 'affiliate_link', 'tracking_code']
      });

      if (!coupon) {
        return ctx.notFound('Coupon not found');
      }

      // Generate unique tracking code if not provided
      const finalTrackingCode = tracking_code || `aff_${affiliate_id}_${Date.now()}`;

      // Update coupon with affiliate data
      const updatedCoupon = await strapi.entityService.update('api::coupon.coupon', coupon_id, {
        data: {
          affiliate_id,
          tracking_code: finalTrackingCode,
          affiliate_link: `${process.env.FRONTEND_URL || 'https://example.com'}/coupon/${coupon_id}?ref=${finalTrackingCode}`
        }
      });

      return {
        success: true,
        message: 'Affiliate link generated successfully',
        affiliate_data: {
          coupon_id,
          affiliate_id,
          tracking_code: finalTrackingCode,
          affiliate_link: updatedCoupon.affiliate_link
        }
      };

    } catch (error) {
      console.error('Error generating affiliate link:', error);
      return ctx.internalServerError('Failed to generate affiliate link');
    }
  }
}));
