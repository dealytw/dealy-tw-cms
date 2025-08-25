import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::merchant-category.merchant-category', ({ strapi }) => ({
  // Get merchants by category slug
  async getMerchantsByCategory(ctx) {
    const { slug } = ctx.params;
    
    try {
      const category = await strapi.entityService.findMany('api::merchant-category.merchant-category', {
        filters: { slug },
        populate: {
          merchants: {
            fields: ['id', 'merchant_name', 'slug', 'summary'],
            filters: { publishedAt: { $notNull: true } }
          }
        }
      });

      if (!category || category.length === 0) {
        return ctx.notFound('Category not found');
      }

      return category[0];
    } catch (error) {
      console.error('Error getting merchants by category:', error);
      return ctx.internalServerError('Failed to get merchants by category');
    }
  },

  // Get categories for taxonomy navigation
  async getTaxonomyNavigation(ctx) {
    try {
      const categories = await strapi.entityService.findMany('api::merchant-category.merchant-category', {
        filters: { publishedAt: { $notNull: true } },
        fields: ['id', 'name', 'slug', 'description', 'color', 'sort_order', 'is_featured'],
        sort: { sort_order: 'asc' }
      });

      // Add merchant count to each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
            filters: { 
              categories: { id: { $eq: category.id } },
              publishedAt: { $notNull: true }
            }
          });

          return {
            ...category,
            merchant_count: merchants?.length || 0
          };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      console.error('Error getting taxonomy navigation:', error);
      return ctx.internalServerError('Failed to get taxonomy navigation');
    }
  },

  // Get featured categories
  async getFeaturedCategories(ctx) {
    try {
      const categories = await strapi.entityService.findMany('api::merchant-category.merchant-category', {
        filters: { 
          is_featured: true,
          publishedAt: { $notNull: true }
        },
        fields: ['id', 'name', 'slug', 'description', 'color'],
        sort: { sort_order: 'asc' }
      });

      // Add merchant count to each category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
            filters: { 
              categories: { id: { $eq: category.id } },
              publishedAt: { $notNull: true }
            }
          });

          return {
            ...category,
            merchant_count: merchants?.length || 0
          };
        })
      );

      return categoriesWithCount;
    } catch (error) {
      console.error('Error getting featured categories:', error);
      return ctx.internalServerError('Failed to get featured categories');
    }
  }
}));

