export default {
  routes: [
    {
      method: 'GET',
      path: '/pages',
      handler: 'page.find',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Get all pages with filters',
        tag: {
          plugin: 'page',
          name: 'Pages',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/pages/:id',
      handler: 'page.findOne',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Get a specific page by ID or slug',
        tag: {
          plugin: 'page',
          name: 'Page',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/pages/navigation',
      handler: 'page.getNavigationPages',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Get pages for navigation menu',
        tag: {
          plugin: 'page',
          name: 'Navigation Pages',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/pages/footer',
      handler: 'page.getFooterPages',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Get pages for footer menu',
        tag: {
          plugin: 'page',
          name: 'Footer Pages',
          actionType: 'read'
        }
      }
    },
    {
      method: 'GET',
      path: '/pages/sitemap',
      handler: 'page.getSitemapData',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
        description: 'Get page data for sitemap generation',
        tag: {
          plugin: 'page',
          name: 'Sitemap Data',
          actionType: 'read'
        }
      }
    }
  ]
};
