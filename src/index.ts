export default {
  register({ strapi }) {
    console.log('🔥🔥🔥 DOCUMENT SERVICE MIDDLEWARE REGISTERED! 🔥🔥🔥');
    
    // Document Service middleware for merchant page_title_h1 automation
    strapi.documents.use(async (ctx, next) => {
      const { uid, action, params } = ctx;
      
      const isMerchant = uid === 'api::merchant.merchant';
      const isWrite = action === 'create' || action === 'update';
      
      if (isMerchant && isWrite && params?.data) {
        const name = params.data.merchant_name;
        if (typeof name !== 'undefined') {
          params.data.page_title_h1 = `${name}優惠碼`;
          console.log('🔥 DOCUMENT MIDDLEWARE: Auto-set page_title_h1:', `${name}優惠碼`);
        }
      }
      
      return next();
    });
  },
  async bootstrap({ strapi }) {
    if (process.env.AUTO_RESTORE_CONFIG !== 'true') return;
    // No plugin on v5 – skip gracefully
    strapi.log.warn('AUTO_RESTORE_CONFIG is true, but config-sync plugin is not available on v5. Skipping.');
  },
};
