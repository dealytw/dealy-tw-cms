export default {
  routes: [
    {
      method: 'GET',
      path: '/merchant-categories',
      handler: 'merchant-category.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/merchant-categories/:id',
      handler: 'merchant-category.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/merchant-categories',
      handler: 'merchant-category.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/merchant-categories/:id',
      handler: 'merchant-category.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/merchant-categories/:id',
      handler: 'merchant-category.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

