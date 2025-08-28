import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      'en',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log('Admin app bootstrap called');
    
    // Try a different approach - register as a plugin page
    app.addMenuLink({
      to: '/coupon-editor',
      icon: 'Puzzle',
      intlLabel: {
        id: 'coupon-editor.nav.label',
        defaultMessage: 'Coupon Editor',
      },
      Component: async () => {
        console.log('Loading CouponEditor component');
        const { default: CouponEditor } = await import('./pages/CouponEditor');
        return CouponEditor;
      },
    });
  },
};
