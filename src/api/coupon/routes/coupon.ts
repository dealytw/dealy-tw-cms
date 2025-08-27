/**
 * coupon router
 */

import { factories } from '@strapi/strapi';

export default {
  routes: [
    {
      method: 'GET',
      path: '/coupons/admin',
      handler: 'coupon.getAdminCoupons',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/coupons/admin/merchants',
      handler: 'coupon.getAdminMerchants',
      config: {
        auth: false
      }
    },
    {
      method: 'PUT',
      path: '/coupons/admin/:id',
      handler: 'coupon.updateCoupon',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/admin/create',
      handler: 'coupon.createCoupon',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/:coupon_id/track-usage',
      handler: 'coupon.trackUsage',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/coupons/approval/:status',
      handler: 'coupon.getCouponsByApprovalStatus',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/bulk-approve',
      handler: 'coupon.bulkApprove',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/bulk-reject',
      handler: 'coupon.bulkReject',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/:id/schedule',
      handler: 'coupon.schedulePublication',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/coupons/ai-generated',
      handler: 'coupon.getAIGeneratedCoupons',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/track-conversion',
      handler: 'coupon.trackAffiliateConversion',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/coupons/affiliate-stats',
      handler: 'coupon.getAffiliateStats',
      config: {
        auth: false
      }
    },
    {
      method: 'POST',
      path: '/coupons/generate-affiliate-link',
      handler: 'coupon.generateAffiliateLink',
      config: {
        auth: false
      }
    }
  ]
};
