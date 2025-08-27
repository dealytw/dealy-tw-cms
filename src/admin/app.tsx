import type { StrapiApp } from '@strapi/strapi/admin';
import { Dashboard, Gift, Search } from '@strapi/icons';

export default {
  config: {
    locales: [
      'en',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log('Admin app bootstrap called');
    
    // Add Dashboard to main menu
    app.addMenuLink({
      to: '/dashboard',
      icon: Dashboard,
      intlLabel: {
        id: 'dashboard.nav.label',
        defaultMessage: 'Dashboard',
      },
      Component: async () => {
        console.log('Loading Dashboard component');
        const { default: Dashboard } = await import('./pages/Dashboard');
        return Dashboard;
      },
    });

    // Add Coupon Editor to main menu
    app.addMenuLink({
      to: '/coupon-editor',
      icon: Gift,
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

    // Add Search Analytics to main menu
    app.addMenuLink({
      to: '/search-analytics',
      icon: Search,
      intlLabel: {
        id: 'search-analytics.nav.label',
        defaultMessage: 'Search Analytics',
      },
      Component: async () => {
        console.log('Loading SearchAnalytics component');
        const { default: SearchAnalytics } = await import('./pages/SearchAnalytics');
        return SearchAnalytics;
      },
    });
  },
};
