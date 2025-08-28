/**
 * coupon service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::coupon.coupon', ({ strapi }) => ({
  // Get coupon with merchant information including logo and page setup
  async getCouponWithMerchant(id) {
    const coupon: any = await strapi.entityService.findOne('api::coupon.coupon', id, {
      populate: {
        merchant: {
          populate: {
            logo: true,
            page_setup: {
              populate: {
                coupon_page_config: true,
                blog_page_config: true
              }
            }
          }
        }
      }
    });
    
    if (coupon?.merchant) {
      // Add URLs to merchant object
      const merchantWithUrls = {
        ...coupon.merchant,
        urls: strapi.service('api::merchant.merchant').getActivePageUrls(coupon.merchant)
      };
      coupon.merchant = merchantWithUrls;
    }
    
    return coupon;
  },

  // Get all coupons with merchant information
  async getAllCouponsWithMerchant(filters = {}) {
    const coupons: any[] = await strapi.entityService.findMany('api::coupon.coupon', {
      filters,
      populate: {
        merchant: {
          populate: {
            logo: true,
            page_setup: {
              populate: {
                coupon_page_config: true,
                blog_page_config: true
              }
            }
          }
        }
      }
    });
    
    // Add URLs to each merchant
    coupons.forEach(coupon => {
      if (coupon.merchant) {
        const merchantWithUrls = {
          ...coupon.merchant,
          urls: strapi.service('api::merchant.merchant').getActivePageUrls(coupon.merchant)
        };
        coupon.merchant = merchantWithUrls;
      }
    });
    
    return coupons;
  },

  // Get coupons by merchant with full merchant information
  async getCouponsByMerchant(merchantId) {
    const coupons: any[] = await strapi.entityService.findMany('api::coupon.coupon', {
      filters: {
        merchant: merchantId
      },
      populate: {
        merchant: {
          populate: {
            logo: true,
            page_setup: {
              populate: {
                coupon_page_config: true,
                blog_page_config: true
              }
            }
          }
        }
      }
    });
    
    // Add URLs to merchant
    if (coupons.length > 0 && coupons[0].merchant) {
      const merchantWithUrls = {
        ...coupons[0].merchant,
        urls: strapi.service('api::merchant.merchant').getActivePageUrls(coupons[0].merchant)
      };
      coupons[0].merchant = merchantWithUrls;
    }
    
    return coupons;
  }
}));
