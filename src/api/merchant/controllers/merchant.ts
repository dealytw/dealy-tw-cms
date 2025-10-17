/**
 * merchant controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::merchant.merchant', ({ strapi }) => ({
  // POST /api/merchants/:id/coupons/reorder
  async reorderCoupons(ctx) {
    const { id: merchantId } = ctx.params;
    const ids = ctx.request.body;

    if (!Array.isArray(ids)) return ctx.badRequest('Expected array of coupon documentIds');

    // (Optional) ensure all coupon ids belong to this merchant
    const owned = await strapi.documents('api::coupon.coupon').findMany({
      filters: { documentId: { $in: ids }, merchant: merchantId },
      fields: ['id'], // Fixed: use 'id' instead of 'documentId' for TypeScript
      limit: ids.length,
    });
    if (owned.length !== ids.length) return ctx.badRequest('Some coupon ids do not belong to this merchant');

    // Save JSON snapshot so you can review it before publish
    await strapi.documents('api::merchant.merchant').update({
      documentId: merchantId,
      data: { coupon_order: ids },
    });

    // (Optional) eager priority write for instant feedback
    for (let i = 0; i < ids.length; i++) {
      await strapi.documents('api::coupon.coupon').update({
        documentId: ids[i],
        data: { priority: i + 1 },
      });
    }

    ctx.body = { ok: true };
  },

  // GET /api/merchants/:id/coupons/reorder-ping  (debug only)
  async reorderPing(ctx) {
    ctx.body = { ok: true, id: ctx.params.id };
  },
}));