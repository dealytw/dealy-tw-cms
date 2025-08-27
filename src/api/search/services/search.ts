export default ({ strapi }: { strapi: any }) => ({
  async buildSearchIndex() {
    try {
      // This function can be used to build search indexes for better performance
      // For now, we'll use Strapi's built-in search capabilities
      
      const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
        filters: { publishedAt: { $notNull: true } },
        fields: ['merchant_name', 'summary', 'slug'],
        populate: ['categories']
      });

      const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
        filters: { 
          publishedAt: { $notNull: true },
          coupon_status: 'active'
        },
        fields: ['coupon_title', 'coupon_description', 'slug'],
        populate: ['merchant']
      });

      const categories = await strapi.entityService.findMany('api::merchant-category.merchant-category', {
        filters: { publishedAt: { $notNull: true } },
        fields: ['name', 'description', 'slug']
      });

      return {
        merchants: merchants.length,
        coupons: coupons.length,
        categories: categories.length,
        total: merchants.length + coupons.length + categories.length
      };
    } catch (error) {
      strapi.log.error('Error building search index:', error);
      throw error;
    }
  },

  async getPopularSearches(limit = 10) {
    try {
      const searches = await strapi.db.query('api::search.search').findMany({
        select: ['query'],
        orderBy: { search_date: 'desc' },
        limit: limit * 2 // Get more to filter unique ones
      });

      // Count occurrences and get unique queries
      const queryCounts = searches.reduce((acc, search) => {
        acc[search.query] = (acc[search.query] || 0) + 1;
        return acc;
      }, {});

      // Sort by count and return top results
      return Object.entries(queryCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, limit)
        .map(([query, count]) => ({ query, count }));
    } catch (error) {
      strapi.log.error('Error getting popular searches:', error);
      return [];
    }
  },

  async getSearchTrends(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const searches = await strapi.db.query('api::search.search').findMany({
        select: ['query', 'search_date', 'market'],
        where: {
          search_date: { $gte: startDate }
        },
        orderBy: { search_date: 'asc' }
      });

      // Group by date and market
      const trends = searches.reduce((acc, search) => {
        const date = search.search_date.toISOString().split('T')[0];
        const market = search.market || 'unknown';
        
        if (!acc[date]) acc[date] = {};
        if (!acc[date][market]) acc[date][market] = 0;
        
        acc[date][market]++;
        return acc;
      }, {});

      return trends;
    } catch (error) {
      strapi.log.error('Error getting search trends:', error);
      return {};
    }
  }
});
