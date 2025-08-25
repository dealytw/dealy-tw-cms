import { generateCompleteSeoData, SeoData } from './seo-schema';

/**
 * SEO Schema Utility for Strapi CMS
 * This is a backend utility that generates SEO data
 */

export function useSeoSchema() {
  /**
   * Generate SEO data for a content type
   */
  const generateSeoData = (
    type: 'coupon' | 'merchant' | 'blog' | 'category',
    data: any,
    baseUrl: string
  ): SeoData => {
    return generateCompleteSeoData(type, data, baseUrl);
  };

  /**
   * Generate HTML meta tags string
   */
  const generateMetaTagsHtml = (seoData: SeoData): string => {
    let html = '';

    // Title
    if (seoData.title) {
      html += `<title>${seoData.title}</title>\n`;
    }

    // Meta description
    if (seoData.description) {
      html += `<meta name="description" content="${seoData.description}">\n`;
    }

    // Open Graph tags
    if (seoData.ogTitle) {
      html += `<meta property="og:title" content="${seoData.ogTitle}">\n`;
    }
    if (seoData.ogDescription) {
      html += `<meta property="og:description" content="${seoData.ogDescription}">\n`;
    }
    if (seoData.ogImage) {
      html += `<meta property="og:image" content="${seoData.ogImage}">\n`;
    }
    if (seoData.ogType) {
      html += `<meta property="og:type" content="${seoData.ogType}">\n`;
    }
    if (seoData.canonicalUrl) {
      html += `<meta property="og:url" content="${seoData.canonicalUrl}">\n`;
    }

    // Twitter Card tags
    if (seoData.twitterCard) {
      html += `<meta name="twitter:card" content="${seoData.twitterCard}">\n`;
    }
    if (seoData.twitterTitle) {
      html += `<meta name="twitter:title" content="${seoData.twitterTitle}">\n`;
    }
    if (seoData.twitterDescription) {
      html += `<meta name="twitter:description" content="${seoData.twitterDescription}">\n`;
    }
    if (seoData.twitterImage) {
      html += `<meta name="twitter:image" content="${seoData.twitterImage}">\n`;
    }

    // Canonical URL
    if (seoData.canonicalUrl) {
      html += `<link rel="canonical" href="${seoData.canonicalUrl}">\n`;
    }

    return html;
  };

  /**
   * Generate JSON-LD structured data script
   */
  const generateStructuredDataScript = (structuredData: any): string => {
    if (!structuredData) return '';

    let html = '';

    // Main structured data
    if (structuredData.main) {
      html += `<script type="application/ld+json">\n${JSON.stringify(structuredData.main, null, 2)}\n</script>\n`;
    }

    // Breadcrumb structured data
    if (structuredData.breadcrumb) {
      html += `<script type="application/ld+json">\n${JSON.stringify(structuredData.breadcrumb, null, 2)}\n</script>\n`;
    }

    return html;
  };

  /**
   * Generate complete HTML head with SEO
   */
  const generateSeoHead = (
    type: 'coupon' | 'merchant' | 'blog' | 'category',
    data: any,
    baseUrl: string
  ): string => {
    const seoData = generateSeoData(type, data, baseUrl);
    const metaTags = generateMetaTagsHtml(seoData);
    const structuredData = generateStructuredDataScript(seoData.structuredData);

    return metaTags + structuredData;
  };

  return {
    generateSeoData,
    generateMetaTagsHtml,
    generateStructuredDataScript,
    generateSeoHead
  };
}
