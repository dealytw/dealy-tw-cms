import type { Context } from 'koa';

export default ({ strapi }: { strapi: any }) => ({
  async find(ctx) {
    try {
      const { market, language, page_type, show_in_navigation, show_in_footer } = ctx.query;

      const filters: any = {
        publishedAt: { $notNull: true }
      };

      if (market && market !== 'global') {
        filters.market = market;
      }

      if (language) {
        filters.language = language;
      }

      if (page_type) {
        filters.page_type = page_type;
      }

      if (show_in_navigation !== undefined) {
        filters.show_in_navigation = show_in_navigation === 'true';
      }

      if (show_in_footer !== undefined) {
        filters.show_in_footer = show_in_footer === 'true';
      }

      const pages = await strapi.entityService.findMany('api::page.page', {
        filters,
        populate: ['featured_image', 'contact_info', 'social_links', 'team_members', 'faq_items'],
        sort: { sort_order: 'asc', title: 'asc' }
      });

      return {
        success: true,
        data: pages
      };
    } catch (error) {
      strapi.log.error('Error finding pages:', error);
      return ctx.internalServerError('Failed to fetch pages');
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const { market, language } = ctx.query;

      const filters: any = {
        $or: [
          { id: id },
          { slug: id }
        ],
        publishedAt: { $notNull: true }
      };

      if (market && market !== 'global') {
        filters.market = market;
      }

      if (language) {
        filters.language = language;
      }

      const page = await strapi.entityService.findMany('api::page.page', {
        filters,
        populate: ['featured_image', 'contact_info', 'social_links', 'team_members', 'faq_items'],
        limit: 1
      });

      if (!page || page.length === 0) {
        return ctx.notFound('Page not found');
      }

      return {
        success: true,
        data: page[0]
      };
    } catch (error) {
      strapi.log.error('Error finding page:', error);
      return ctx.internalServerError('Failed to fetch page');
    }
  },

  async getNavigationPages(ctx) {
    try {
      const { market, language } = ctx.query;

      const filters: any = {
        publishedAt: { $notNull: true },
        show_in_navigation: true
      };

      if (market && market !== 'global') {
        filters.market = market;
      }

      if (language) {
        filters.language = language;
      }

      const pages = await strapi.entityService.findMany('api::page.page', {
        filters,
        fields: ['title', 'slug', 'page_type', 'sort_order'],
        sort: { sort_order: 'asc', title: 'asc' }
      });

      return {
        success: true,
        data: pages
      };
    } catch (error) {
      strapi.log.error('Error getting navigation pages:', error);
      return ctx.internalServerError('Failed to fetch navigation pages');
    }
  },

  async getFooterPages(ctx) {
    try {
      const { market, language } = ctx.query;

      const filters: any = {
        publishedAt: { $notNull: true },
        show_in_footer: true
      };

      if (market && market !== 'global') {
        filters.market = market;
      }

      if (language) {
        filters.language = language;
      }

      const pages = await strapi.entityService.findMany('api::page.page', {
        filters,
        fields: ['title', 'slug', 'page_type', 'sort_order'],
        sort: { sort_order: 'asc', title: 'asc' }
      });

      return {
        success: true,
        data: pages
      };
    } catch (error) {
      strapi.log.error('Error getting footer pages:', error);
      return ctx.internalServerError('Failed to fetch footer pages');
    }
  },

  async getSitemapData(ctx) {
    try {
      const { market } = ctx.query;

      const filters: any = {
        publishedAt: { $notNull: true }
      };

      if (market && market !== 'global') {
        filters.market = market;
      }

      const pages = await strapi.entityService.findMany('api::page.page', {
        filters,
        fields: ['slug', 'page_type', 'updatedAt', 'market'],
        sort: { updatedAt: 'desc' }
      });

      return {
        success: true,
        data: pages.map(page => ({
          slug: page.slug,
          type: page.page_type,
          lastModified: page.updatedAt,
          market: page.market
        }))
      };
    } catch (error) {
      strapi.log.error('Error getting sitemap data:', error);
      return ctx.internalServerError('Failed to fetch sitemap data');
    }
  }
});
