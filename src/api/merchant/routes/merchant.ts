/**
 * merchant router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::merchant.merchant', {
  config: {
    find: {
      middlewares: [],
    },
    findOne: {
      middlewares: [],
    },
    create: {
      middlewares: [],
    },
    update: {
      middlewares: [],
    },
    delete: {
      middlewares: [],
    },
  },
});

// Custom routes will be added via the admin panel or separate route files
