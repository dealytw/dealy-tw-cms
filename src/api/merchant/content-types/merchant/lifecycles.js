'use strict';

console.log('🔥🔥🔥 MERCHANT LIFECYCLE FILE IS BEING LOADED! 🔥🔥🔥');

// Strapi v5 lifecycle hook for merchant content type
module.exports = {
  async beforeCreate(event) {
    console.log('🔥 MERCHANT LIFECYCLE: beforeCreate triggered');
    const { data } = event.params;
    if (data.merchant_name) {
      data.page_title_h1 = `${data.merchant_name}優惠碼`;
      console.log('🔥 MERCHANT LIFECYCLE: Auto-assigned page_title_h1:', `${data.merchant_name}優惠碼`);
    }
  },

  async beforeUpdate(event) {
    console.log('🔥 MERCHANT LIFECYCLE: beforeUpdate triggered');
    const { data } = event.params;
    // Only recompute if merchant_name changes or if page_title_h1 is empty
    if (typeof data.merchant_name !== 'undefined') {
      data.page_title_h1 = `${data.merchant_name}優惠碼`;
      console.log('🔥 MERCHANT LIFECYCLE: Auto-updated page_title_h1:', `${data.merchant_name}優惠碼`);
    }
  },
};
