export default {
  register() {},
  async bootstrap({ strapi }) {
    if (process.env.AUTO_RESTORE_CONFIG !== 'true') return;
    const plugin = strapi.plugin?.('config-sync');
    if (!plugin) {
      strapi.log.warn('config-sync plugin not found; skipping auto-restore.');
      return;
    }
    try {
      await plugin.service('core').restore();
      strapi.log.info('✅ Config restored from ./config/sync');
    } catch (err) {
      strapi.log.error('❌ Config restore failed:', err);
    }
  },
};
