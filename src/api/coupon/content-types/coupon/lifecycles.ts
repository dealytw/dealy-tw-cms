// Cloud-safe coupon lifecycles: no imports, no strict typing.

// Position → max fake cap for that position within a merchant’s active list
function capForPosition(pos: number) {
  const caps = [50, 45, 40, 35, 30, 25, 20, 15, 12, 10]; // pos 1..10
  const idx = Math.min(Math.max(pos, 1), caps.length) - 1;
  return caps[idx];
}

function fakeCountForPosition(pos: number) {
  const cap = capForPosition(pos);
  const low = Math.max(5, cap - 10);
  return Math.floor(low + Math.random() * (cap - low + 1));
}

async function countActiveForMerchant(merchantId?: number | string) {
  if (!merchantId) return 0;
  try {
    return await strapi.entityService.count('api::coupon.coupon', {
      filters: { merchant: merchantId, coupon_status: 'active' },
    });
  } catch (e) {
    strapi.log.warn('[coupon lifecycles] countActiveForMerchant failed:', e);
    return 0;
  }
}

export default {
  async beforeCreate(event: any) {
    const data = event.params?.data || {};

    // Ensure UID
    if (!data.coupon_uid) {
      const rand = Math.random().toString(36).slice(2, 8);
      data.coupon_uid = `${Date.now().toString(36)}-${rand}`;
    }

    // Defaults
    if (data.priority == null) data.priority = 0;
    if (data.clicks_real == null) data.clicks_real = 0;

    // Seed a fake base for display_count once
    if (data.display_count == null) {
      let merchantId: number | string | undefined;

      // in create, merchant is usually a numeric id
      if (typeof data.merchant === 'number' || typeof data.merchant === 'string') {
        merchantId = data.merchant;
      }

      let pos = 1;
      if (merchantId) {
        const count = await countActiveForMerchant(merchantId);
        pos = (count || 0) + 1;
      }

      data.display_count = fakeCountForPosition(pos);
    }
  },

  async beforeUpdate(event: any) {
    const data = event.params?.data || {};
    if (!data) return;

    if (data.coupon_uid === '' || data.coupon_uid == null) {
      const rand = Math.random().toString(36).slice(2, 8);
      data.coupon_uid = `${Date.now().toString(36)}-${rand}`;
    }
    if (data.priority == null) data.priority = 0;
    if (data.clicks_real == null) data.clicks_real = 0;

    // NOTE: no “recompute for merchant” here (keeps Cloud build simple).
  },
};
