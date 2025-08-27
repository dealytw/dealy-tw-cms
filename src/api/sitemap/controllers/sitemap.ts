
import { generateMarketSitemap, generateGlobalSitemap, generateSitemapIndex } from '../../../utils/sitemap-generator';

export default ({ strapi }: { strapi: any }) => ({
  async generateSitemap(ctx) {
    try {
      const { market } = ctx.query;
      const baseUrl = process.env.SITE_URL || 'https://dealy.tw';

      let sitemapXml: string;

      if (market && market !== 'global') {
        sitemapXml = await generateMarketSitemap(strapi, baseUrl, market);
      } else {
        sitemapXml = await generateGlobalSitemap(strapi, baseUrl);
      }

      ctx.set('Content-Type', 'application/xml');
      ctx.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      return sitemapXml;
    } catch (error) {
      strapi.log.error('Error generating sitemap:', error);
      return ctx.internalServerError('Failed to generate sitemap');
    }
  },

  async generateSitemapIndex(ctx) {
    try {
      const baseUrl = process.env.SITE_URL || 'https://dealy.tw';
      const markets = ['TW', 'HK', 'JP', 'KR', 'MY', 'SG', 'THAI', 'VIET', 'INDONESIA'];
      
      const sitemapIndexXml = await generateSitemapIndex(strapi, baseUrl, markets);

      ctx.set('Content-Type', 'application/xml');
      ctx.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      return sitemapIndexXml;
    } catch (error) {
      strapi.log.error('Error generating sitemap index:', error);
      return ctx.internalServerError('Failed to generate sitemap index');
    }
  },

  async generateRobotsTxt(ctx) {
    try {
      const baseUrl = process.env.SITE_URL || 'https://dealy.tw';
      const markets = ['TW', 'HK', 'JP', 'KR', 'MY', 'SG', 'THAI', 'VIET', 'INDONESIA'];
      
      let robotsTxt = `User-agent: *\nAllow: /\n\n`;
      robotsTxt += `Sitemap: ${baseUrl}/sitemap.xml\n`;
      
      // Add market-specific sitemaps
      markets.forEach(market => {
        robotsTxt += `Sitemap: ${baseUrl}/sitemap-${market.toLowerCase()}.xml\n`;
      });

      ctx.set('Content-Type', 'text/plain');
      ctx.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      return robotsTxt;
    } catch (error) {
      strapi.log.error('Error generating robots.txt:', error);
      return ctx.internalServerError('Failed to generate robots.txt');
    }
  },

  async getSitemapStats(ctx) {
    try {
      const { market } = ctx.query;
      
      let stats = {
        totalUrls: 0,
        merchants: 0,
        coupons: 0,
        categories: 0,
        topics: 0,
        pages: 0,
        lastGenerated: new Date().toISOString()
      };

      // Count merchants
      const merchantFilters = { publishedAt: { $notNull: true } };
      if (market && market !== 'global') {
        // Note: merchants don't have market field yet
        // merchantFilters.market = market;
      }
      
      stats.merchants = await strapi.entityService.count('api::merchant.merchant', merchantFilters);

      // Count coupons
             const couponFilters: any = { 
         publishedAt: { $notNull: true },
         coupon_status: 'active'
       };
      if (market && market !== 'global') {
        couponFilters.market = market;
      }
      
      stats.coupons = await strapi.entityService.count('api::coupon.coupon', couponFilters);

      // Count categories
      stats.categories = await strapi.entityService.count('api::merchant-category.merchant-category', {
        publishedAt: { $notNull: true }
      });

      // Count topics
             const topicFilters: any = { publishedAt: { $notNull: true } };
      if (market && market !== 'global') {
        topicFilters.market = market;
      }
      
      stats.topics = await strapi.entityService.count('api::topic.topic', topicFilters);

      // Count pages
             const pageFilters: any = { publishedAt: { $notNull: true } };
      if (market && market !== 'global') {
        pageFilters.market = market;
      }
      
      stats.pages = await strapi.entityService.count('api::page.page', pageFilters);

      // Calculate total
      stats.totalUrls = stats.merchants + stats.coupons + stats.categories + stats.topics + stats.pages + 1; // +1 for homepage

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      strapi.log.error('Error getting sitemap stats:', error);
      return ctx.internalServerError('Failed to get sitemap stats');
    }
  }
});
