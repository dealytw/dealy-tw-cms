export default {
  register() {},
  async bootstrap({ strapi }) {
    if (process.env.AUTO_RESTORE_CONFIG !== 'true') return;
    // No plugin on v5 – skip gracefully
    strapi.log.warn('AUTO_RESTORE_CONFIG is true, but config-sync plugin is not available on v5. Skipping.');
  },
};
