export default {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.search',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Search across merchants, coupons, categories, and topics',
        tag: {
          plugin: 'search',
          name: 'Search',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/search/suggestions',
      handler: 'search.getSearchSuggestions',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Get search suggestions and autocomplete',
        tag: {
          plugin: 'search',
          name: 'Search Suggestions',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/search/analytics',
      handler: 'search.getSearchAnalytics',
      config: {
        auth: {
          scope: ['admin::is-authenticated']
        },
        policies: [],
        middlewares: [],
        description: 'Get search analytics (admin only)',
        tag: {
          plugin: 'search',
          name: 'Search Analytics',
          actionType: 'read'
        }
      }
    }
  ]
};
