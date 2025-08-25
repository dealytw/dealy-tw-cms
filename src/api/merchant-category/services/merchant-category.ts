import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::merchant-category.merchant-category', ({ strapi }) => ({
  // Get category by slug with merchants
  async findBySlug(slug: string) {
    return await strapi.entityService.findMany('api::merchant-category.merchant-category', {
      filters: { slug },
      populate: {
        merchants: {
          filters: { publishedAt: { $notNull: true } },
          fields: ['id', 'merchant_name', 'slug', 'page_description', 'page_title', 'summary']
        }
      }
    });
  },

  // Get categories for navigation
  async getNavigationCategories() {
    return await strapi.entityService.findMany('api::merchant-category.merchant-category', {
      filters: { publishedAt: { $notNull: true } },
      fields: ['id', 'name', 'slug', 'description', 'color'],
      sort: { sort_order: 'asc' }
    });
  }
}));

