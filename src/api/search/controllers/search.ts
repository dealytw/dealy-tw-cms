export default ({ strapi }: { strapi: any }) => ({
  async search(ctx) {
    try {
      const { 
        query, 
        type = 'all', 
        market, 
        category, 
        couponType, 
        page = 1, 
        limit = 20 
      } = ctx.query;

      if (!query || query.trim().length < 2) {
        return ctx.badRequest('Search query must be at least 2 characters long');
      }

      const searchQuery = query.trim().toLowerCase();
      const offset = (page - 1) * limit;
      
      let results = {
        merchants: [],
        coupons: [],
        categories: [],
        topics: [],
        total: 0,
        page,
        limit
      };

      // Search merchants
      if (type === 'all' || type === 'merchant') {
        const merchantQuery: any = {
          $or: [
            { merchant_name: { $containsi: searchQuery } },
            { summary: { $containsi: searchQuery } },
            { store_description: { $containsi: searchQuery } }
          ],
          publishedAt: { $notNull: true }
        };

        if (market) {
          // Note: merchants don't have market field yet, but we can add it
          // merchantQuery.market = market;
        }

        if (category) {
          merchantQuery.categories = {
            $or: [
              { name: { $containsi: category } },
              { slug: { $containsi: category } }
            ]
          };
        }

        const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
          filters: merchantQuery,
          populate: ['logo', 'categories'],
          start: offset,
          limit: type === 'merchant' ? limit : Math.ceil(limit / 4),
          sort: { merchant_name: 'asc' }
        });

        results.merchants = merchants;
      }

      // Search coupons
      if (type === 'all' || type === 'coupon') {
        const couponQuery: any = {
          $or: [
            { coupon_title: { $containsi: searchQuery } },
            { coupon_description: { $containsi: searchQuery } }
          ],
          publishedAt: { $notNull: true },
          coupon_status: 'active'
        };

        if (market) {
          couponQuery.market = market;
        }

        if (couponType) {
          couponQuery.coupon_type = couponType;
        }

        if (category) {
          couponQuery.merchant = {
            categories: {
              $or: [
                { name: { $containsi: category } },
                { slug: { $containsi: category } }
              ]
            }
          };
        }

        const coupons = await strapi.entityService.findMany('api::coupon.coupon', {
          filters: couponQuery,
          populate: ['merchant', 'coupon_image'],
          start: offset,
          limit: type === 'coupon' ? limit : Math.ceil(limit / 4),
          sort: { createdAt: 'desc' }
        });

        results.coupons = coupons;
      }

      // Search categories
      if (type === 'all' || type === 'category') {
        const categoryQuery: any = {
          $or: [
            { name: { $containsi: searchQuery } },
            { description: { $containsi: searchQuery } }
          ],
          publishedAt: { $notNull: true }
        };

        const categories = await strapi.entityService.findMany('api::merchant-category.merchant-category', {
          filters: categoryQuery,
          populate: ['icon'],
          start: offset,
          limit: type === 'category' ? limit : Math.ceil(limit / 4),
          sort: { sort_order: 'asc', name: 'asc' }
        });

        results.categories = categories;
      }

      // Search topics
      if (type === 'all' || type === 'topic') {
        const topicQuery: any = {
          $or: [
            { title: { $containsi: searchQuery } },
            { intro: { $containsi: searchQuery } }
          ],
          publishedAt: { $notNull: true }
        };

        if (market) {
          topicQuery.market = market;
        }

        const topics = await strapi.entityService.findMany('api::topic.topic', {
          filters: topicQuery,
          start: offset,
          limit: type === 'topic' ? limit : Math.ceil(limit / 4),
          sort: { createdAt: 'desc' }
        });

        results.topics = topics;
      }

      // Calculate total results
      results.total = results.merchants.length + results.coupons.length + 
                     results.categories.length + results.topics.length;

      // Log search for analytics
      await strapi.entityService.create('api::search.search', {
        data: {
          query: searchQuery,
          search_type: type,
          market,
          category_filter: category,
          coupon_type_filter: couponType,
          results_count: results.total,
          user_ip: ctx.request.ip,
          user_agent: ctx.request.headers['user-agent'],
          session_id: ctx.request.headers['x-session-id'] || 'unknown'
        }
      });

      return {
        success: true,
        data: results,
        meta: {
          query: searchQuery,
          type,
          market,
          category,
          couponType
        }
      };

    } catch (error) {
      strapi.log.error('Search error:', error);
      return ctx.internalServerError('Search failed');
    }
  },

  async getSearchSuggestions(ctx) {
    try {
      const { query, market } = ctx.query;

      if (!query || query.trim().length < 2) {
        return ctx.badRequest('Query must be at least 2 characters long');
      }

      const searchQuery = query.trim().toLowerCase();
      const suggestions = [];

      // Get merchant name suggestions
      const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
        filters: {
          merchant_name: { $containsi: searchQuery },
          publishedAt: { $notNull: true }
        },
        fields: ['merchant_name', 'slug'],
        limit: 5,
        sort: { merchant_name: 'asc' }
      });

      suggestions.push(...merchants.map(m => ({
        type: 'merchant',
        text: m.merchant_name,
        slug: m.slug,
        url: `/shop/${m.slug}`
      })));

      // Get category suggestions
      const categories = await strapi.entityService.findMany('api::merchant-category.merchant-category', {
        filters: {
          name: { $containsi: searchQuery },
          publishedAt: { $notNull: true }
        },
        fields: ['name', 'slug'],
        limit: 3,
        sort: { name: 'asc' }
      });

      suggestions.push(...categories.map(c => ({
        type: 'category',
        text: c.name,
        slug: c.slug,
        url: `/category/${c.slug}`
      })));

      // Get popular search terms
      const popularSearches = await strapi.db.query('api::search.search').findMany({
        select: ['query'],
        where: {
          query: { $containsi: searchQuery }
        },
        orderBy: { search_date: 'desc' },
        limit: 3
      });

      const uniqueQueries = [...new Set(popularSearches.map(s => s.query))];
      suggestions.push(...uniqueQueries.map(q => ({
        type: 'suggestion',
        text: q,
        url: `/search?q=${encodeURIComponent(q as string)}`
      })));

      return {
        success: true,
        data: suggestions.slice(0, 10) // Limit to 10 suggestions
      };

    } catch (error) {
      strapi.log.error('Search suggestions error:', error);
      return ctx.internalServerError('Failed to get suggestions');
    }
  },

  async getSearchAnalytics(ctx) {
    try {
      const { days = 30 } = ctx.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get search statistics
      const searchStats = await strapi.db.query('api::search.search').findMany({
        select: ['query', 'search_type', 'market', 'results_count', 'search_date'],
        where: {
          search_date: { $gte: startDate }
        },
        orderBy: { search_date: 'desc' }
      });

      // Calculate analytics
      const totalSearches = searchStats.length;
      const avgResults = searchStats.reduce((sum, s) => sum + s.results_count, 0) / totalSearches || 0;
      
      const searchTypes = searchStats.reduce((acc, s) => {
        acc[s.search_type] = (acc[s.search_type] || 0) + 1;
        return acc;
      }, {});

      const markets = searchStats.reduce((acc, s) => {
        if (s.market) {
          acc[s.market] = (acc[s.market] || 0) + 1;
        }
        return acc;
      }, {});

      const topQueries = searchStats.reduce((acc, s) => {
        acc[s.query] = (acc[s.query] || 0) + 1;
        return acc;
      }, {});

      const topQueriesArray = Object.entries(topQueries)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      return {
        success: true,
        data: {
          totalSearches,
          avgResults: Math.round(avgResults * 100) / 100,
          searchTypes,
          markets,
          topQueries: topQueriesArray,
          period: `${days} days`
        }
      };

    } catch (error) {
      strapi.log.error('Search analytics error:', error);
      return ctx.internalServerError('Failed to get analytics');
    }
  }
});
