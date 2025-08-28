export default {
  routes: [
    {
      method: 'GET',
      path: '/',
      handler: 'index',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
