// src/api/merchant/content-types/merchant/lifecycles.ts

export default {
  /**
   * v5.22 lifecycle: runs before a Merchant is updated via admin
   * Reads merchant.coupon_order (array of coupon documentIds)
   * and writes priority = 1..N on those coupons.
   */
  async beforeUpdate(event: { params: { data: any; where: any } }) {
    const { params } = event;
    // Try multiple ways to get the merchant ID - prioritize documentId from data
    const merchantId = params.data?.documentId || params.where?.documentId || params.where?.id || params.where?.id?.$eq;
    
    strapi.log.info(`[priority-sync] Lifecycle params: ${JSON.stringify(params, null, 2)}`);
    strapi.log.info(`[priority-sync] Extracted merchantId: ${merchantId}`);

    // Only proceed if we have a valid merchantId and coupon_order is present in the update data
    if (!merchantId) {
      strapi.log.warn(`[priority-sync] No merchantId found in lifecycle params, skipping priority update.`);
      return;
    }

    if (params.data && Array.isArray(params.data.coupon_order)) {
      const order: string[] = params.data.coupon_order;

      if (!order.length) {
        strapi.log.info(`[priority-sync] Merchant ${merchantId}: coupon_order is empty, skipping priority update.`);
        return;
      }

      strapi.log.info(`[priority-sync] Merchant ${merchantId}: Processing coupon_order for priority update.`);
      strapi.log.info(`[priority-sync] Order array: ${JSON.stringify(order)}`);

      try {
        // Fetch all coupons for this merchant to get their current state
        const coupons = await strapi.documents('api::coupon.coupon').findMany({
          filters: {
            merchant: { documentId: merchantId },
          },
          fields: ['id', 'priority', 'coupon_title'], // Use 'id' instead of 'documentId' for fields
          publicationState: 'preview', // Include draft entries
          limit: 9999, // Ensure all coupons are fetched
        }) as any[];

        strapi.log.info(`[priority-sync] Found ${coupons.length} coupons for merchant ${merchantId}`);

        // Map coupons by their documentId for quick lookup
        const couponMap = new Map<string, { documentId: string; priority: number; coupon_title: string }>(
          coupons.map(c => [c.documentId || c.id, { documentId: c.documentId || c.id, priority: c.priority, coupon_title: c.coupon_title }])
        );

        const updates: Promise<any>[] = [];
        let priority = 1;

        // 1) Assign priority to coupons present in the coupon_order
        for (const couponDocumentId of order) {
          const coupon = couponMap.get(couponDocumentId);
          if (coupon) {
            if (coupon.priority !== priority) {
              updates.push(
                strapi.documents('api::coupon.coupon').update({
                  documentId: coupon.documentId,
                  data: { priority: priority },
                })
              );
              strapi.log.info(`[priority-sync] Updating coupon "${coupon.coupon_title}" (${coupon.documentId}) to priority ${priority}`);
            } else {
              strapi.log.info(`[priority-sync] Coupon "${coupon.coupon_title}" (${coupon.documentId}) already has priority ${priority}`);
            }
            couponMap.delete(couponDocumentId); // Remove from map once processed
          } else {
            strapi.log.warn(`[priority-sync] Coupon ${couponDocumentId} from order not found for merchant ${merchantId}.`);
          }
          priority++;
        }

        // 2) (Optional) Assign remaining coupons to the end of the order
        // This ensures all coupons have a priority, even if not in coupon_order
        for (const remainingCoupon of couponMap.values()) {
          if (remainingCoupon.priority !== priority) {
            updates.push(
              strapi.documents('api::coupon.coupon').update({
                documentId: remainingCoupon.documentId,
                data: { priority: priority },
              })
            );
            strapi.log.info(`[priority-sync] Updating remaining coupon "${remainingCoupon.coupon_title}" (${remainingCoupon.documentId}) to priority ${priority}`);
          }
          priority++;
        }

        if (updates.length > 0) {
          await Promise.all(updates);
          strapi.log.info(`[priority-sync] Merchant ${merchantId}: Successfully updated ${updates.length} coupon priorities.`);
        } else {
          strapi.log.info(`[priority-sync] Merchant ${merchantId}: All coupon priorities already up to date.`);
        }

      } catch (err: any) {
        strapi.log.error(`[priority-sync] Merchant ${merchantId} lifecycle error: ${err?.stack || err?.message || String(err)}`);
      }
    }
  },
};
