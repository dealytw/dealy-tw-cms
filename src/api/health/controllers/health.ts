export default {
  async check(ctx) {
    try {
      // Check database connection
      await strapi.connection.raw('SELECT 1');
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        version: strapi.config.get('info.version'),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      };
    } catch (error) {
      ctx.status = 503;
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        environment: process.env.NODE_ENV || 'development'
      };
    }
  }
};
