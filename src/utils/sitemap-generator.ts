

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  market?: string;
  includeImages?: boolean;
  includeNews?: boolean;
}

export class SitemapGenerator {
  private strapi: any;
  private config: SitemapConfig;

  constructor(strapi: any, config: SitemapConfig) {
    this.strapi = strapi;
    this.config = config;
  }

  async generateSitemap(): Promise<string> {
    try {
      const urls = await this.getAllUrls();
      return this.generateXml(urls);
    } catch (error) {
      this.strapi.log.error('Error generating sitemap:', error);
      throw error;
    }
  }

  private async getAllUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = [];

    // Add homepage
    urls.push({
      loc: this.config.baseUrl,
      changefreq: 'daily',
      priority: 1.0
    });

    // Add merchants
    const merchants = await this.strapi.entityService.findMany('api::merchant.merchant', {
      filters: { 
        publishedAt: { $notNull: true },
        ...(this.config.market && { market: this.config.market })
      },
      fields: ['slug', 'updatedAt'],
      sort: { updatedAt: 'desc' }
    });

    merchants.forEach(merchant => {
      urls.push({
        loc: `${this.config.baseUrl}/shop/${merchant.slug}`,
        lastmod: merchant.updatedAt?.toISOString(),
        changefreq: 'weekly',
        priority: 0.8
      });
    });

    // Add coupons
    const coupons = await this.strapi.entityService.findMany('api::coupon.coupon', {
      filters: { 
        publishedAt: { $notNull: true },
        coupon_status: 'active',
        ...(this.config.market && { market: this.config.market })
      },
      fields: ['slug', 'updatedAt'],
      sort: { updatedAt: 'desc' }
    });

    coupons.forEach(coupon => {
      urls.push({
        loc: `${this.config.baseUrl}/coupon/${coupon.slug}`,
        lastmod: coupon.updatedAt?.toISOString(),
        changefreq: 'daily',
        priority: 0.7
      });
    });

    // Add categories
    const categories = await this.strapi.entityService.findMany('api::merchant-category.merchant-category', {
      filters: { publishedAt: { $notNull: true } },
      fields: ['slug', 'updatedAt'],
      sort: { updatedAt: 'desc' }
    });

    categories.forEach(category => {
      urls.push({
        loc: `${this.config.baseUrl}/category/${category.slug}`,
        lastmod: category.updatedAt?.toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      });
    });

    // Add topics
    const topics = await this.strapi.entityService.findMany('api::topic.topic', {
      filters: { 
        publishedAt: { $notNull: true },
        ...(this.config.market && { market: this.config.market })
      },
      fields: ['slug', 'updatedAt'],
      sort: { updatedAt: 'desc' }
    });

    topics.forEach(topic => {
      urls.push({
        loc: `${this.config.baseUrl}/topic/${topic.slug}`,
        lastmod: topic.updatedAt?.toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      });
    });

    // Add static pages
    const pages = await this.strapi.entityService.findMany('api::page.page', {
      filters: { 
        publishedAt: { $notNull: true },
        ...(this.config.market && { market: this.config.market })
      },
      fields: ['slug', 'page_type', 'updatedAt'],
      sort: { updatedAt: 'desc' }
    });

    pages.forEach(page => {
      urls.push({
        loc: `${this.config.baseUrl}/${page.slug}`,
        lastmod: page.updatedAt?.toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      });
    });

    return urls;
  }

  private generateXml(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const urlsetClose = '</urlset>';

    const urlElements = urls.map(url => {
      let element = `  <url>\n    <loc>${this.escapeXml(url.loc)}</loc>`;
      
      if (url.lastmod) {
        element += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      
      if (url.changefreq) {
        element += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      
      if (url.priority) {
        element += `\n    <priority>${url.priority}</priority>`;
      }
      
      element += '\n  </url>';
      return element;
    }).join('\n');

    return `${xmlHeader}\n${urlsetOpen}\n${urlElements}\n${urlsetClose}`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  async generateSitemapIndex(markets: string[]): Promise<string> {
    try {
      const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
      const sitemapindexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
      const sitemapindexClose = '</sitemapindex>';

      const sitemapElements = markets.map(market => {
        const lastmod = new Date().toISOString();
        return `  <sitemap>\n    <loc>${this.config.baseUrl}/sitemap-${market.toLowerCase()}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`;
      }).join('\n');

      return `${xmlHeader}\n${sitemapindexOpen}\n${sitemapElements}\n${sitemapindexClose}`;
    } catch (error) {
      this.strapi.log.error('Error generating sitemap index:', error);
      throw error;
    }
  }
}

// Utility function to generate sitemap for a specific market
export async function generateMarketSitemap(strapi: any, baseUrl: string, market: string): Promise<string> {
  const generator = new SitemapGenerator(strapi, {
    baseUrl,
    market,
    includeImages: false,
    includeNews: false
  });
  
  return await generator.generateSitemap();
}

// Utility function to generate global sitemap
export async function generateGlobalSitemap(strapi: any, baseUrl: string): Promise<string> {
  const generator = new SitemapGenerator(strapi, {
    baseUrl,
    includeImages: false,
    includeNews: false
  });
  
  return await generator.generateSitemap();
}

// Utility function to generate sitemap index
export async function generateSitemapIndex(strapi: any, baseUrl: string, markets: string[]): Promise<string> {
  const generator = new SitemapGenerator(strapi, { baseUrl });
  return await generator.generateSitemapIndex(markets);
}
