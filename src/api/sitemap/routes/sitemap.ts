export default {
  routes: [
    {
      method: 'GET',
      path: '/sitemap.xml',
      handler: 'sitemap.generateSitemap',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Generate XML sitemap for all content',
        tag: {
          plugin: 'sitemap',
          name: 'Sitemap',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/sitemap-:market.xml',
      handler: 'sitemap.generateSitemap',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Generate XML sitemap for specific market',
        tag: {
          plugin: 'sitemap',
          name: 'Market Sitemap',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/sitemap-index.xml',
      handler: 'sitemap.generateSitemapIndex',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Generate sitemap index for all markets',
        tag: {
          plugin: 'sitemap',
          name: 'Sitemap Index',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/robots.txt',
      handler: 'sitemap.generateRobotsTxt',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Generate robots.txt file',
        tag: {
          plugin: 'sitemap',
          name: 'Robots.txt',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/sitemap/stats',
      handler: 'sitemap.getSitemapStats',
      config: {
        auth: {
          scope: ['admin::is-authenticated']
        },
        policies: [],
        middlewares: [],
        description: 'Get sitemap statistics (admin only)',
        tag: {
          plugin: 'sitemap',
          name: 'Sitemap Stats',
          actionType: 'read'
        }
      }
    }
  ]
};
