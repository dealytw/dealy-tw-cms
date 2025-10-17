import Router from '@koa/router';

export default {
  register({ strapi }) {
    console.log('🔥🔥🔥 DOCUMENT SERVICE MIDDLEWARE REGISTERED! 🔥🔥🔥');
    
    // Document Service middleware for merchant page_title_h1 automation
    strapi.documents.use(async (ctx, next) => {
      const { uid, action, params } = ctx;
      
      const isMerchant = uid === 'api::merchant.merchant';
      const isWrite = action === 'create' || action === 'update';
      
      if (isMerchant && isWrite && params?.data) {
        const name = params.data.merchant_name;
        if (typeof name !== 'undefined') {
          params.data.page_title_h1 = `${name}優惠碼`;
          console.log('🔥 DOCUMENT MIDDLEWARE: Auto-set page_title_h1:', `${name}優惠碼`);
        }
      }
      
      return next();
    });
    
    const router = new Router({ prefix: '/api' });

    router.get('/merchants/:id/coupons/reorder-ping', async (ctx) => {
      ctx.body = { ok: true, id: ctx.params.id };
    });

    router.post('/merchants/:id/coupons/reorder', async (ctx) => {
      try {
        const merchantId = String(ctx.params.id);
        const body = ctx.request.body as any;

        // Debug logs (will print in server console)
        strapi.log.info('[reorder] raw body: %s', JSON.stringify(body));

        // Accept: array, {ids:[...]}, or {rows:[{couponId,order}]}
        let ids: string[] = [];
        if (Array.isArray(body)) ids = body;
        else if (Array.isArray(body?.ids)) ids = body.ids;
        else if (Array.isArray(body?.rows)) ids = body.rows.map((r: any) => r?.couponId).filter(Boolean);

        ids = (ids || []).map(String).filter(Boolean);

        // Store the order
        await strapi.documents('api::merchant.merchant').update({
          documentId: merchantId,
          data: { coupon_order: ids },
        });

        ctx.body = { ok: true, count: ids.length, received: body, stored: ids };
      } catch (err: any) {
        strapi.log.error('[reorder] error: %s', err?.stack || err?.message || String(err));
        ctx.status = 500;
        ctx.body = { error: 'Internal error' };
      }
    });

    strapi.server.use(router.routes()).use(router.allowedMethods());

    const UID_M = 'api::merchant.merchant';
    const UID_C = 'api::coupon.coupon';

    // Anti-loop guard
    const GUARD_MS = 3000;
    const guard = new Set<string>();
    const withGuard = async (key: string, fn: () => Promise<void>) => {
      if (guard.has(key)) return;
      guard.add(key);
      try { await fn(); } finally { setTimeout(() => guard.delete(key), GUARD_MS); }
    };

    // Update merchant SEO title based on priority 1 coupon
    const updateMerchantSeoTitle = async (merchantId: string) => {
      try {
        const merchant = await strapi.documents(UID_M).findOne({
          documentId: merchantId,
          fields: ['merchant_name'],
        });
        
        if (!merchant?.merchant_name) return;

        // Get the priority 1 active coupon for this merchant
        const [topCoupon] = await strapi.documents(UID_C).findMany({
          filters: { 
            merchant: { documentId: merchantId }, 
            coupon_status: { $eq: 'active' },
            priority: { $eq: 1 }
          },
          fields: ['coupon_title', 'priority'],
          limit: 1,
        });

        const seoTitle = topCoupon?.coupon_title
          ? `${merchant.merchant_name} 優惠碼 | ${topCoupon.coupon_title}`
          : `${merchant.merchant_name} 優惠碼`;

        await strapi.documents(UID_M).update({
          documentId: merchantId,
          data: { seo_title: seoTitle },
        });

        strapi.log.info('[seo_title] Updated merchant %s: %s', merchantId, seoTitle);
      } catch (e: any) {
        strapi.log.error('[seo_title] Failed to update merchant %s: %s', merchantId, e?.stack || String(e));
      }
    };

    // Strapi v5 Documents Service Middleware - Auto-update merchant SEO when coupon changes
    strapi.documents.use(async (ctx: any, next: any) => {
      const out = await next(); // Let Strapi do the write/read first

      try {
        const { uid, action } = ctx;
        const isWrite = action === 'create' || action === 'update';
        
        // Debug logging
        strapi.log.info(`[middleware] Action: ${action}, UID: ${uid}, isWrite: ${isWrite}`);
        
        if (!isWrite) return out;

        // When a coupon is saved → automatically update and publish its merchant's SEO title
        if (uid === UID_C) {
          const coupon = ctx.result;
          
          // Debug: Log everything we have access to
          strapi.log.info(`[middleware] Full ctx.params: ${JSON.stringify(ctx.params, null, 2)}`);
          strapi.log.info(`[middleware] Full ctx.result: ${JSON.stringify(coupon, null, 2)}`);
          
          let merchantId = null;
          
          // Method 1: From params.data.merchant.connect (if merchant is being connected)
          if (Array.isArray(ctx.params?.data?.merchant?.connect) && ctx.params.data.merchant.connect.length > 0) {
            merchantId = String(ctx.params.data.merchant.connect[0]);
            strapi.log.info(`[middleware] Found merchantId in params.data.merchant.connect: ${merchantId}`);
          }
          
          // Method 2: From params.data.merchant (if it's a direct ID string)
          if (!merchantId && typeof ctx.params?.data?.merchant === 'string') {
            merchantId = ctx.params.data.merchant;
            strapi.log.info(`[middleware] Found merchantId in params.data.merchant (string): ${merchantId}`);
          }
          
          // Method 3: From result.merchant (if it's populated and not undefined)
          if (!merchantId && coupon?.merchant) {
            if (typeof coupon.merchant === 'string') {
              merchantId = coupon.merchant;
              strapi.log.info(`[middleware] Found merchantId in result.merchant (string): ${merchantId}`);
            } else if (typeof coupon.merchant === 'object' && coupon.merchant.documentId) {
              merchantId = coupon.merchant.documentId;
              strapi.log.info(`[middleware] Found merchantId in result.merchant (object): ${merchantId}`);
            }
          }
          
          // Method 4: If still no merchantId, fetch the coupon again with explicit populate
          // This is the most reliable method when merchant relation is not being updated
          if (!merchantId && ctx.params?.documentId) {
            strapi.log.info(`[middleware] MerchantId not found, re-fetching coupon ${ctx.params.documentId} with explicit merchant populate.`);
            try {
              // Use explicit populate with fields to get the documentId
              const fullCoupon = await strapi.documents(UID_C).findOne({
                documentId: ctx.params.documentId,
                populate: { 
                  merchant: { 
                    fields: ['documentId', 'merchant_name'] 
                  } 
                }
              });
              
              if (fullCoupon?.merchant) {
                if (typeof fullCoupon.merchant === 'string') {
                  merchantId = fullCoupon.merchant;
                  strapi.log.info(`[middleware] Found merchantId after populate (string): ${merchantId}`);
                } else if (typeof fullCoupon.merchant === 'object' && fullCoupon.merchant.documentId) {
                  merchantId = fullCoupon.merchant.documentId;
                  strapi.log.info(`[middleware] Found merchantId after populate (object): ${merchantId}`);
                  strapi.log.info(`[middleware] Merchant name: ${fullCoupon.merchant.merchant_name}`);
                }
              } else {
                strapi.log.warn(`[middleware] No merchant found in populated coupon: ${JSON.stringify(fullCoupon, null, 2)}`);
              }
            } catch (e) {
              strapi.log.error(`[middleware] Failed to fetch coupon with merchant: ${e.message}`);
            }
          }
          
          // Method 5: Fallback using entityService (more reliable for some cases)
          if (!merchantId && ctx.params?.documentId) {
            strapi.log.info(`[middleware] Trying entityService fallback for coupon ${ctx.params.documentId}`);
            try {
              const couponWithMerchant = await strapi.entityService.findOne(UID_C, ctx.params.documentId, {
                populate: ['merchant']
              });
              
              if (couponWithMerchant?.merchant) {
                if (typeof couponWithMerchant.merchant === 'string') {
                  merchantId = couponWithMerchant.merchant;
                  strapi.log.info(`[middleware] Found merchantId via entityService (string): ${merchantId}`);
                } else if (typeof couponWithMerchant.merchant === 'object') {
                  merchantId = couponWithMerchant.merchant.documentId || couponWithMerchant.merchant.id;
                  strapi.log.info(`[middleware] Found merchantId via entityService (object): ${merchantId}`);
                }
              }
            } catch (e) {
              strapi.log.error(`[middleware] entityService fallback failed: ${e.message}`);
            }
          }
          
          if (merchantId) {
            await withGuard(`seo:${merchantId}`, async () => {
              // Get merchant info
              const merchant = await strapi.documents(UID_M).findOne({
                documentId: merchantId,
                fields: ['merchant_name'],
              });
              
              strapi.log.info(`[middleware] Found merchant: ${merchant?.merchant_name}`);
              
              if (!merchant?.merchant_name) {
                strapi.log.warn(`[middleware] No merchant name found for ID: ${merchantId}`);
                return;
              }

              // Get the priority 1 active coupon for this merchant
              const [topCoupon] = await strapi.documents(UID_C).findMany({
                filters: { 
                  merchant: { documentId: merchantId }, 
                  coupon_status: { $eq: 'active' },
                  priority: { $eq: 1 }
                },
                fields: ['coupon_title', 'priority'],
                limit: 1,
              });

              strapi.log.info(`[middleware] Found priority 1 coupon: ${topCoupon?.coupon_title}`);

              const seoTitle = topCoupon?.coupon_title
                ? `${merchant.merchant_name} 優惠碼 | ${topCoupon.coupon_title}`
                : `${merchant.merchant_name} 優惠碼`;

              strapi.log.info(`[middleware] About to update merchant ${merchantId} with seo_title: ${seoTitle}`);

              // Auto-update and publish the merchant
              await strapi.documents(UID_M).update({
                documentId: merchantId,
                data: { seo_title: seoTitle },
              });

              strapi.log.info(`[seo_title] AUTO-UPDATED merchant ${merchantId}: ${seoTitle}`);
            });
          } else {
            strapi.log.warn(`[middleware] No merchantId found in coupon result`);
          }
        }

        // When a merchant is saved → update its own SEO title
        if (uid === UID_M) {
          const merchant = ctx.result;
          const merchantId = merchant?.documentId ?? merchant?.id;
          
          if (merchantId) {
            await withGuard(`seo:${merchantId}`, async () => {
              await updateMerchantSeoTitle(merchantId);
            });
          }
        }
      } catch (e: any) {
        strapi.log.error(`[documents middleware] Error: ${e?.stack || String(e)}`);
      }

      return out; // Forward the original response
    });
  },
  async bootstrap({ strapi }) {
    if (process.env.AUTO_RESTORE_CONFIG !== 'true') return;
    // No plugin on v5 – skip gracefully
    strapi.log.warn('AUTO_RESTORE_CONFIG is true, but config-sync plugin is not available on v5. Skipping.');
  },
};
