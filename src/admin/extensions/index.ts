import { StrapiAdmin } from '@strapi/admin/strapi-admin';

export default {
  register(app: StrapiAdmin) {
    // Register the coupon editor page
    app.addPage({
      Component: async () => {
        const { default: CouponEditor } = await import('./pages/CouponEditor');
        return CouponEditor;
      },
      to: '/coupon-editor',
      exact: true,
    });

    // Add to the main navigation
    app.addNavigationLink({
      to: '/coupon-editor',
      icon: 'Puzzle',
      intlLabel: {
        id: 'coupon-editor.nav.label',
        defaultMessage: 'Coupon Editor',
      },
    });
  },

  bootstrap(app: StrapiAdmin) {
    // Admin initialization
  },
};
