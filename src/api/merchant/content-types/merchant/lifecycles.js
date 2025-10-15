module.exports = {
  async afterUpdate(event) {
    try {
      const result = event?.result || {};
      const merchantId  = result.id;
      const merchantDoc = result.documentId;
      const order = Array.isArray(result.coupon_order) ? result.coupon_order : [];

      const allCoupons = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: {
          merchant: merchantDoc ? { documentId: merchantDoc } : { id: merchantId },
        },
        fields: ['id', 'documentId', 'priority'],
        limit: 1000,
      });

      const wanted = order.map(String);
      const rank = new Map(wanted.map((id, idx) => [id, idx + 1]));

      let next = wanted.length + 1;
      await Promise.allSettled(
        allCoupons.map(c => {
          const pr = rank.get(String(c.id)) ?? next++;
          return strapi.entityService.update('api::coupon.coupon', c.id, { data: { priority: pr } });
        })
      );
    } catch (e) {
      strapi.log.error('[priority-sync] failed', e);
    }
  },
};
