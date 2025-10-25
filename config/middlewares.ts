export default [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:8080','http://localhost:8081','https://cms.dealy.tw','https://admin.dealy.tw'], // Admin app custom domain
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
