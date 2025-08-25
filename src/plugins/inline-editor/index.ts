import pluginId from './admin/src/pluginId';

export default {
  register(app: any) {
    // Try the most basic v5 pattern
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: 'Puzzle',
      intlLabel: { 
        id: `${pluginId}.plugin.name`, 
        defaultMessage: 'Coupon Editor' 
      },
      Component: async () => {
        const { default: App } = await import('./admin/src/pages/App');
        return App;
      },
    });
  },

  bootstrap(app: any) {},
};
