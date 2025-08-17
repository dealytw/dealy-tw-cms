import type { Lifecycle } from '@strapi/strapi';
import { randomUUID } from 'crypto';

const SCOPE_BY_MARKET = true; // rank within each merchant AND market

// --- helpers ---------------------------------------------------------

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Top ≈ 45–60, bottom ≈ 3–12, with small jitter
function scoreForRank(i: number, n: number) {
  const topMin = 45, topMax = 60;
  const botMin = 3,  botMax = 12;
  if (n <= 1) return randInt(topMin, topMax);
  const t = i / (n - 1); // 0 (top) → 1 (bottom)
  const topAvg = (topMin + topMax) / 2;
  const botAvg = (botMin + botMax) / 2;
  const base = topAvg + (botAvg - topAvg) * t;
  const jitter = (Math.random() * 6) - 3; // ±3
  return Math.max(0, Math.round(base + jitter));
}

async function recomputeForMerchant(merchantId?: number, market?: string) {
  if (!merchantId) return;

  // NOTE: your status field is named "coupon_status"
  const filters: any = { merchant: merchantId, coupon_status: 'active' };
  if (SCOPE_BY_MARKET && market) filters.market = market;

  // Order to match display: priority desc, then sooner expiry
  const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
    filters,
    sort: ['priority:desc', 'expires_at:asc', 'createdAt:asc'],
    fields: ['id'],
    limit: 1000,
  });

  const n = coupons.length;
  for (let i = 0; i < n; i++) {
    const score = scoreForRank(i, n);
    await strapi.entityService.update('api::coupon.coupon', coupons[i].id, {
      data: { display_count: score },
    }).catch(() => {});
  }
}

// --- lifecycles ------------------------------------------------------

export default {
  // 1) Auto-generate coupon_uid if missing
  async beforeCreate(event) {
    const d = event.params.data;
    if (!d.coupon_uid) {
      let mslug: string | undefined;
      if (d.merchant) {
        const m = await strapi.entityService
          .findOne('api::merchant.merchant', d.merchant, { fields: ['slug'] })
          .catch(() => null);
        mslug = m?.slug ? slugify(m.slug) : undefined;
      }
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      d.coupon_uid = `${mslug || 'coupon'}-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
    }
  },

  async beforeUpdate(event) {
    const d = event.params.data;
    if (d && !d.coupon_uid) {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      d.coupon_uid = `coupon-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
    }
  },

  // 2) Seed last_click_at on create; 3) Recompute display_count per merchant(+market)
  async afterCreate(event) {
    try {
      const id = event.result.id;
      const c = await strapi.entityService.findOne('api::coupon.coupon', id, {
        populate: { merchant: { fields: ['id'] } },
        fields: ['market', 'last_click_at', 'publishedAt', 'createdAt'],
      });

      if (c && !c.last_click_at) {
        await strapi.entityService.update('api::coupon.coupon', id, {
          data: { last_click_at: c.publishedAt || c.createdAt },
        }).catch(() => {});
      }

      await recomputeForMerchant(c?.merchant?.id, c?.market);
    } catch {}
  },

  async afterUpdate(event) {
    try {
      const id = (event.params as any)?.where?.id ?? event?.result?.id;
      if (!id) return;
      const c = await strapi.entityService.findOne('api::coupon.coupon', id, {
        populate: { merchant: { fields: ['id'] } },
        fields: ['market'],
      });
      await recomputeForMerchant(c?.merchant?.id, c?.market);
    } catch {}
  },
} satisfies Lifecycle;
