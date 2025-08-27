export default {
  routes: () => require('./routes/search'),
  controllers: () => require('./controllers/search'),
  services: () => require('./services/search'),
  contentTypes: () => require('./content-types/search'),
};
