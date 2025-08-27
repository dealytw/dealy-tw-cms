import { StrapiAdmin } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiAdmin) {
    // Admin extensions can be added here if needed
    // Currently all menu items are handled in src/admin/app.tsx
  },

  bootstrap(app: StrapiAdmin) {
    // Admin initialization
  },
};
