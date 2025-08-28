import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::coupon.coupon', ({ strapi }) => ({

  // POST /api/coupons/:id/click
  async click(ctx) {
    const id = ctx.params?.id;
    if (!id) return ctx.badRequest('missing id');

    const row = await strapi.entityService.findOne('api::coupon.coupon', id, {
      fields: ['id', 'display_count', 'clicks_real'],
    });
    if (!row) return ctx.notFound();

    const nextDisplay = (row.display_count || 0) + 1;
    const nextReal = (row.clicks_real || 0) + 1;

    await strapi.entityService.update('api::coupon.coupon', id, {
      data: { display_count: nextDisplay, clicks_real: nextReal, last_click_at: new Date() },
    });

    ctx.body = { ok: true, id, display_count: nextDisplay, clicks_real: nextReal };
  },

  // POST /api/coupon/click  { coupon_uid }
  async clickByUid(ctx) {
    const uid = ctx.request?.body?.coupon_uid || ctx.request?.query?.coupon_uid;
    if (!uid) return ctx.badRequest('missing coupon_uid');

    const rows = await strapi.entityService.findMany('api::coupon.coupon', {
      filters: { coupon_uid: uid },
      fields: ['id', 'display_count', 'clicks_real'],
      limit: 1,
    });
    const hit = rows?.[0];
    if (!hit) return ctx.notFound();

    const nextDisplay = (hit.display_count || 0) + 1;
    const nextReal = (hit.clicks_real || 0) + 1;

    await strapi.entityService.update('api::coupon.coupon', hit.id, {
      data: { display_count: nextDisplay, clicks_real: nextReal, last_click_at: new Date() },
    });

    ctx.body = { ok: true, id: hit.id, display_count: nextDisplay, clicks_real: nextReal };
  },

}));
