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

  try {
    // NOTE: your status field is named "coupon_status"
    const filters: any = { merchant: merchantId, coupon_status: 'active' };
    if (SCOPE_BY_MARKET && market) filters.market = market;

    // Order to match display: priority desc, then sooner expiry
    const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
      filters,
      sort: ['priority:desc', 'expiration_date:asc', 'createdAt:asc'],
      fields: ['id'],
      limit: 1000,
    });

    const n = coupons.length;
    for (let i = 0; i < n; i++) {
      const score = scoreForRank(i, n);
      await strapi.entityService.update('api::coupon.coupon', coupons[i].id, {
        data: { display_count: score },
      });
    }
  } catch (error) {
    strapi.log.warn('Error recomputing merchant display counts:', error);
  }
}

// --- Strapi v5 compatible lifecycles ------------------------------------------------------

export default {
  // Auto-generate coupon_uid if missing
  async beforeCreate(event: any) {
    const { data } = event.params;
    
    if (!data.coupon_uid) {
      let mslug: string | undefined;
      if (data.merchant) {
        try {
          // Use a simpler approach to avoid the "connect" operator issue
          const m = await strapi.entityService.findOne('api::merchant.merchant', data.merchant, { 
            fields: ['slug']
          });
          mslug = m?.slug ? slugify(m.slug) : undefined;
        } catch (error) {
          strapi.log.warn('Error fetching merchant slug:', error);
          // Continue without merchant slug if there's an error
        }
      }
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      data.coupon_uid = `${mslug || 'coupon'}-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
    }

    // Set default values
    if (data.display_count === undefined) data.display_count = 0;
    if (data.user_count === undefined) data.user_count = 0;
    if (data.priority === undefined) data.priority = 0;
    if (!data.coupon_status) data.coupon_status = 'active';
    if (!data.market) data.market = 'TW';
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    
    if (data && !data.coupon_uid) {
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      data.coupon_uid = `coupon-${stamp}-${randomUUID().slice(0, 8).toUpperCase()}`;
    }

    // Check if expiration date has passed and update status
    if (data.expiration_date) {
      const expirationDate = new Date(data.expiration_date);
      const now = new Date();
      const threeDaysAfterExpiry = new Date(expirationDate);
      threeDaysAfterExpiry.setDate(threeDaysAfterExpiry.getDate() + 3);

      if (now > threeDaysAfterExpiry) {
        data.coupon_status = 'expired';
      } else if (now > expirationDate) {
        data.coupon_status = 'expired';
      }
    }
  },

  // Seed last_click_at and recompute display_count
  async afterCreate(event: any) {
    try {
      const id = event.result.id;
      const coupon = await strapi.entityService.findOne('api::coupon.coupon', id, {
        fields: ['market', 'last_click_at', 'publishedAt', 'createdAt'],
      });

      // Set last_click_at if not set
      if (coupon && !coupon.last_click_at) {
        await strapi.entityService.update('api::coupon.coupon', id, {
          data: { last_click_at: coupon.publishedAt || coupon.createdAt },
        });
      }

      // Recompute display counts for this merchant
      // Since we're not populating merchant, we need to get it from the original data
      const merchantId = event.params.data.merchant;
      await recomputeForMerchant(merchantId, coupon?.market);
    } catch (error) {
      strapi.log.warn('Error in afterCreate lifecycle:', error);
    }
  },

  async afterUpdate(event: any) {
    try {
      const id = event.params.where?.id ?? event.result?.id;
      if (!id) return;
      
      const coupon = await strapi.entityService.findOne('api::coupon.coupon', id, {
        fields: ['market'],
      });
      
      // Recompute display counts for this merchant
      // Since we're not populating merchant, we need to get it from the original data
      const merchantId = event.params.data.merchant;
      await recomputeForMerchant(merchantId, coupon?.market);

      // Log if status changed to expired
      if (event.result?.coupon_status === 'expired') {
        strapi.log.info(`Coupon ${id} has been automatically expired`);
      }
    } catch (error) {
      strapi.log.warn('Error in afterUpdate lifecycle:', error);
    }
  }
};
