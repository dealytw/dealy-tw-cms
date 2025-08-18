// src/api/coupon/content-types/coupon/lifecycles.ts
// No imports; keep it runtime-only to avoid TS build errors on Cloud.

export default {
  /**
   * Before creating a coupon, auto-fill:
   * - coupon_uid (if missing)
   * - priority default 0
   * - display_count: fake number based on position among the merchant's active coupons
   */
  async beforeCreate(event) {
    const data = event.params?.data || {};

    // 1) UID fallback
    if (!data.coupon_uid) {
      const rand = Math.random().toString(36).slice(2, 8);
      data.coupon_uid = `${Date.now().toString(36)}-${rand}`;
    }

    // 2) default priority
    if (data.priority == null) data.priority = 0;

    // 3) fake display_count by rank within the same merchant
    if (data.display_count == null) {
      let merchantId;

      // Strapi Admin usually sends relation as a numeric/string id
      if (typeof data.merchant === 'number' || typeof data.merchant === 'string') {
        merchantId = data.merchant;
      }

      let position = 1; // first item by default
      try {
        if (merchantId) {
          const count = await strapi.entityService.count('api::coupon.coupon', {
            filters: {
              merchant: merchantId,
              coupon_status: 'active',
            },
          });
          position = (count || 0) + 1;
        }
      } catch (e) {
        strapi.log.warn('[coupon lifecycles] count failed:', e);
      }

      // Cap by position (1..10). Lower rows get smaller fake numbers.
      const caps = [50, 45, 40, 35, 30, 25, 20, 15, 12, 10];
      const cap = caps[Math.min(Math.max(position, 1), caps.length) - 1];
      const low = Math.max(5, cap - 10);
      data.display_count = Math.floor(low + Math.random() * (cap - low + 1));
    }
  },

  async beforeUpdate(event) {
    const data = event.params?.data || {};
    if (!data) return;

    // Keep uid stable, but rebuild if someone cleared it
    if (data.coupon_uid === '' || data.coupon_uid == null) {
      const rand = Math.random().toString(36).slice(2, 8);
      data.coupon_uid = `${Date.now().toString(36)}-${rand}`;
    }

    if (data.priority == null) data.priority = 0;
  },
};
