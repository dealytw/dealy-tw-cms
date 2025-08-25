import pluginId from './pluginId';

export const name = pluginId;

export default {
  register(app: any) {
    // Register the main menu item
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: 'Puzzle',
      intlLabel: { 
        id: `${pluginId}.plugin.name`, 
        defaultMessage: 'Coupon Editor' 
      },
      Component: async () => {
        const { default: App } = await import('./pages/App');
        return App;
      },
    });
  },

  bootstrap() {
    // Plugin initialization logic
  },
};
