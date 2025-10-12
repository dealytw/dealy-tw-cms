// Cloud-safe coupon lifecycles: no imports, no strict typing.

// Position → max fake cap for that position within a merchant's active list
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
      filters: {
        // Type-safe relation filter:
        merchant: { id: merchantId as any },
        coupon_status: 'active',
      } as any, // keep TS calm on nested types
    });
  } catch (e) {
    strapi.log.warn('[coupon lifecycles] countActiveForMerchant failed:', e);
    return 0;
  }
}

// Generate 12-digit alphanumeric UID
function generateRandomUID(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format merchant name for UID (lowercase, replace spaces with underscores)
function formatMerchantName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Generate unique UID with merchant name prefix
async function generateUniqueCouponUID(merchantName?: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const randomUID = generateRandomUID();
    const uid = merchantName ? `${formatMerchantName(merchantName)}_${randomUID}` : randomUID;
    
    try {
      const existing = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: { coupon_uid: uid },
        limit: 1,
      });
      
      if (!existing || existing.length === 0) {
        return uid;
      }
    } catch (e) {
      strapi.log.warn('[coupon lifecycles] UID uniqueness check failed:', e);
      // If check fails, return the UID anyway (database unique constraint will catch duplicates)
      return uid;
    }
    
    attempts++;
  }
  
  // Fallback: add timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36).slice(-4);
  const randomUID = generateRandomUID().slice(0, 6);
  return merchantName ? `${formatMerchantName(merchantName)}_${randomUID}${timestamp}` : `${randomUID}${timestamp}`;
}

// Get merchant name by ID
async function getMerchantName(merchantId: number | string): Promise<string | undefined> {
  try {
    console.log('[COUPON LIFECYCLE] Getting merchant name for ID:', merchantId);
    const merchant = await strapi.entityService.findOne('api::merchant.merchant', merchantId as any, {
      fields: ['merchant_name'],
    });
    console.log('[COUPON LIFECYCLE] Found merchant:', merchant);
    return merchant?.merchant_name;
  } catch (e) {
    console.log('[COUPON LIFECYCLE] getMerchantName failed:', e);
    strapi.log.warn('[coupon lifecycles] getMerchantName failed:', e);
    return undefined;
  }
}


export default {
  async beforeCreate(event: any) {
    console.log('[COUPON LIFECYCLE] beforeCreate triggered', { data: event.params?.data });
    const data = event.params?.data || {};

    // Always generate UID if empty, null, or just whitespace
    if (!data.coupon_uid || data.coupon_uid.trim() === '') {
      console.log('[COUPON LIFECYCLE] Generating UID for coupon');
      let merchantName: string | undefined;
      
      // Get merchant name if merchant relation is provided
      if (data.merchant) {
        console.log('[COUPON LIFECYCLE] Getting merchant name for:', data.merchant);
        merchantName = await getMerchantName(data.merchant);
        console.log('[COUPON LIFECYCLE] Merchant name:', merchantName);
      }
      
      data.coupon_uid = await generateUniqueCouponUID(merchantName);
      console.log('[COUPON LIFECYCLE] Generated UID:', data.coupon_uid);
    } else {
      console.log('[COUPON LIFECYCLE] UID already exists:', data.coupon_uid);
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

    // Regenerate UID if empty or if merchant relation changed
    const shouldRegenerateUID = data.coupon_uid === '' || data.coupon_uid == null || data.coupon_uid.trim() === '' || data.merchant !== undefined;
    
    if (shouldRegenerateUID) {
      let merchantName: string | undefined;
      
      // Get merchant name if merchant relation is provided
      if (data.merchant) {
        merchantName = await getMerchantName(data.merchant);
      } else if (event.params?.where?.id) {
        // If no merchant in data but we have an existing coupon, get current merchant
        try {
          const existingCoupon = await strapi.entityService.findOne('api::coupon.coupon', event.params.where.id, {
            populate: { merchant: true },
          });
          if (existingCoupon && typeof existingCoupon === 'object' && 'merchant' in existingCoupon) {
            const merchant = (existingCoupon as any).merchant;
            if (merchant && typeof merchant === 'object' && 'merchant_name' in merchant) {
              merchantName = merchant.merchant_name;
            }
          }
        } catch (e) {
          strapi.log.warn('[coupon lifecycles] Failed to get existing merchant:', e);
        }
      }
      
      data.coupon_uid = await generateUniqueCouponUID(merchantName);
    }
    
    if (data.priority == null) data.priority = 0;
    if (data.clicks_real == null) data.clicks_real = 0;
  },
};
