export default [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:8080','https://studio.dealy.tw'], // Updated for your local port
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      headers: '*',
      credentials: true,
    },
  },
  'strapi::security',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
