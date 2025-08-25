/**
 * merchant controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::merchant.merchant', ({ strapi }) => ({
  // Get merchant with URLs and page setup
  async getMerchantWithUrls(ctx) {
    const { id } = ctx.params;
    
    try {
      const merchant = await strapi.service('api::merchant.merchant').getMerchantWithUrls(id);
      
      if (!merchant) {
        return ctx.notFound('Merchant not found');
      }
      
      return { data: merchant };
    } catch (error) {
      return ctx.badRequest('Error fetching merchant', { error: error.message });
    }
  },

  // Get all merchants with URLs and page setup
  async getAllMerchantsWithUrls(ctx) {
    try {
      const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
        populate: {
          page_setup: {
            populate: {
              coupon_page_config: true,
              blog_page_config: true
            }
          },
          logo: true
        }
      });
      
      // Add URLs to each merchant
      const merchantsWithUrls = merchants.map(merchant => ({
        ...merchant,
        urls: strapi.service('api::merchant.merchant').getActivePageUrls(merchant)
      }));
      
      return { data: merchantsWithUrls };
    } catch (error) {
      return ctx.badRequest('Error fetching merchants', { error: error.message });
    }
  },

  // Get merchants by page approach
  async getMerchantsByPageApproach(ctx) {
    const { approach } = ctx.query;
    
    if (!approach || !['coupon_page', 'blog_page', 'both'].includes(approach as string)) {
      return ctx.badRequest('Invalid approach parameter');
    }
    
    try {
      const merchants = await strapi.entityService.findMany('api::merchant.merchant', {
        filters: {
          page_setup: {
            page_approach: approach
          }
        } as any,
        populate: {
          page_setup: {
            populate: {
              coupon_page_config: true,
              blog_page_config: true
            }
          },
          logo: true
        } as any
      });
      
      // Add URLs to each merchant
      const merchantsWithUrls = merchants.map(merchant => ({
        ...merchant,
        urls: strapi.service('api::merchant.merchant').getActivePageUrls(merchant)
      }));
      
      return { data: merchantsWithUrls };
    } catch (error) {
      return ctx.badRequest('Error fetching merchants', { error: error.message });
    }
  },

  async getSeoSchema(ctx) {
    try {
      const { id } = ctx.params;
      
      // Fetch merchant with populated fields
      const merchant = await strapi.entityService.findOne('api::merchant.merchant', id, {
        populate: {
          logo: true,
          coupons: true,
          faq: true
        }
      });

      if (!merchant) {
        return ctx.notFound('Merchant not found');
      }

      const merchantData = merchant as any; // Type assertion for populated fields
      const merchantUrl = merchantData.site_url || merchantData.canonical_url || `https://dealy.tw/merchant/${merchantData.slug}`;

      // Check if auto SEO is enabled globally
      const isAutoSeoEnabled = merchantData.auto_seo_enabled !== false;

      // Build the schema graph
      const schema: any = {
        "@context": "https://schema.org",
        "@graph": []
      };

      // Organization
      const organizationSchema: any = {
        "@type": "Organization",
        "@id": `${merchantUrl}#organization`,
        "name": merchantData.merchant_name,
        "url": merchantUrl,
        "inLanguage": "zh-HK"
      };

      if (merchantData.logo?.url) {
        organizationSchema.logo = {
          "@type": "ImageObject",
          "url": merchantData.logo.url
        };
      }

      if (merchantData.summary) {
        organizationSchema.description = merchantData.summary;
      }

      schema["@graph"].push(organizationSchema);

      // Store
      const storeSchema: any = {
        "@type": "Store",
        "@id": `${merchantUrl}#store`,
        "name": merchantData.merchant_name,
        "url": merchantUrl,
        "inLanguage": "zh-HK",
        "parentOrganization": { "@id": `${merchantUrl}#organization` }
      };

      if (merchantData.store_description) {
        storeSchema.description = merchantData.store_description;
      }

      schema["@graph"].push(storeSchema);

      // ItemList for coupons
      if (merchantData.coupons && merchantData.coupons.length > 0) {
        const itemListSchema: any = {
          "@type": "ItemList",
          "@id": `${merchantUrl}#coupons`,
          "name": `${merchantData.merchant_name} Coupons`,
          "description": `Available coupons and deals from ${merchantData.merchant_name}`,
          "url": merchantUrl,
          "inLanguage": "zh-HK",
          "itemListElement": merchantData.coupons.map((coupon: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Offer",
              "name": coupon.coupon_title,
              "description": coupon.description,
              "url": coupon.affiliate_link || merchantData.default_affiliate_link || merchantUrl,
              "priceCurrency": "TWD",
              "availability": "https://schema.org/InStock"
            }
          }))
        };

        schema["@graph"].push(itemListSchema);
      }

      // WebSite
      schema["@graph"].push({
        "@type": "WebSite",
        "@id": `${process.env.SITE_URL || 'https://dealy.tw'}#website`,
        "name": "Dealy.tw",
        "url": process.env.SITE_URL || 'https://dealy.tw',
        "inLanguage": "zh-HK",
        "publisher": { "@id": `${process.env.SITE_URL || 'https://dealy.tw'}#organization` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${process.env.SITE_URL || 'https://dealy.tw'}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      });

      // WebPage - Use auto SEO or manual fields based on auto_seo_enabled
      const webpageSchema: any = {
        "@type": "WebPage",
        "@id": merchantUrl,
        "url": merchantUrl,
        "inLanguage": "zh-HK",
        "isPartOf": { "@id": `${process.env.SITE_URL || 'https://dealy.tw'}#website` },
        "about": { "@id": `${merchantUrl}#merchant` }
      };

      if (isAutoSeoEnabled) {
        // Auto SEO: Use basic merchant info
        webpageSchema.name = merchantData.merchant_name;
        if (merchantData.summary) {
          webpageSchema.description = merchantData.summary;
        }
      } else {
        // Manual SEO: Use the SEO fields
        webpageSchema.name = merchantData.seo_title || merchantData.merchant_name;
        if (merchantData.seo_description) {
          webpageSchema.description = merchantData.seo_description;
        }
      }

      schema["@graph"].push(webpageSchema);

      // Add FAQ schema if available
      if (merchantData.faq && merchantData.faq.length > 0) {
        const faqSchema: any = {
          "@type": "FAQPage",
          "@id": `${merchantUrl}#faq`,
          "mainEntity": merchantData.faq.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        };

        schema["@graph"].push(faqSchema);
      }

      return ctx.send(schema);
    } catch (error) {
      console.error('Error generating SEO schema:', error);
      return ctx.internalServerError('Error generating SEO schema');
    }
  }
}));
