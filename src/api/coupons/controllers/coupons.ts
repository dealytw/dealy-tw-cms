// Simple coupons controller for Strapi Cloud
export default {
  // Get all coupons with pagination and filters
  async find(ctx) {
    try {
      const { query } = ctx;
      
      // Use Strapi's built-in entity service
      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        populate: ['merchant'],
        filters: query.filters || {},
        sort: query.sort || { createdAt: 'desc' },
        pagination: query.pagination || { page: 1, pageSize: 25 },
      });

      return { data: coupons, meta: { pagination: query.pagination } };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Get single coupon
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const coupon = await strapi.entityService.findOne('api::coupon.coupon', id, {
        populate: ['merchant'],
      });
      
      if (!coupon) {
        return ctx.notFound('Coupon not found');
      }
      
      return { data: coupon };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Create new coupon
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      
      // Validate required fields
      if (!data.title || !data.merchant) {
        return ctx.badRequest('Title and merchant are required');
      }

      const coupon = await strapi.entityService.create('api::coupon.coupon', {
        data: {
          ...data,
          publishedAt: new Date(),
        },
        populate: ['merchant'],
      });

      return { data: coupon };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Update coupon
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      const coupon = await strapi.entityService.update('api::coupon.coupon', id, {
        data,
        populate: ['merchant'],
      });

      return { data: coupon };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Delete coupon
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.entityService.delete('api::coupon.coupon', id);
      return { success: true };
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  // Search coupons
  async search(ctx) {
    try {
      const { query } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: {
          $or: [
            { title: { $containsi: query } },
            { description: { $containsi: query } },
            { code: { $containsi: query } },
          ],
        },
        populate: ['merchant'],
        sort: { createdAt: 'desc' },
      });

      return { data: coupons };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
};
