export interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

export interface CouponSeoData extends SeoData {
  couponTitle: string;
  merchantName: string;
  discount?: string;
  expiryDate?: string;
  couponCode?: string;
}

export interface MerchantSeoData extends SeoData {
  merchantName: string;
  category?: string;
  location?: string;
  description: string; // Override to make required
}

export interface BlogSeoData extends SeoData {
  blogTitle: string;
  author?: string;
  publishDate?: string;
  category?: string;
  tags?: string[];
}

// Generate meta title based on content type and data
export function generateMetaTitle(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any): string {
  const maxLength = 60;
  
  switch (type) {
    case 'coupon':
      const couponTitle = data.coupon_title || data.title || '';
      const merchantName = data.merchant?.merchant_name || data.merchant_name || '';
      const discount = data.coupon_discount || data.discount || '';
      
      let title = `${couponTitle}`;
      if (merchantName) title += ` - ${merchantName}`;
      if (discount) title += ` | ${discount}`;
      
      return truncateString(title, maxLength);
      
    case 'merchant':
      const merchantTitle = data.merchant_name || data.title || '';
      const category = data.categories?.[0]?.name || data.category || '';
      
      let merchantTitleFinal = `${merchantTitle}`;
      if (category) merchantTitleFinal += ` - ${category}`;
      
      return truncateString(merchantTitleFinal, maxLength);
      
    case 'blog':
      const blogTitle = data.title || data.blog_title || '';
      return truncateString(blogTitle, maxLength);
      
    case 'category':
      const categoryName = data.name || data.category_name || '';
      return truncateString(`${categoryName} Coupons & Deals`, maxLength);
      
    default:
      return truncateString(data.title || 'Dealy TW - Best Coupons & Deals', maxLength);
  }
}

// Generate meta description based on content type and data
export function generateMetaDescription(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any): string {
  const maxLength = 160;
  
  switch (type) {
    case 'coupon':
      const couponDesc = data.coupon_description || data.description || '';
      const merchantName = data.merchant?.merchant_name || data.merchant_name || '';
      const discount = data.coupon_discount || data.discount || '';
      
      let desc = couponDesc;
      if (!desc && merchantName && discount) {
        desc = `Get ${discount} at ${merchantName}. Limited time offer!`;
      } else if (!desc && merchantName) {
        desc = `Exclusive deals and coupons from ${merchantName}. Save money today!`;
      }
      
      return truncateString(desc, maxLength);
      
    case 'merchant':
      const merchantDesc = data.page_description || data.description || '';
      const category = data.categories?.[0]?.name || data.category || '';
      
      let merchantDescFinal = merchantDesc;
      if (!merchantDesc && category) {
        merchantDescFinal = `Discover the best ${category} deals and coupons from ${data.merchant_name}. Save money on your purchases!`;
      }
      
      return truncateString(merchantDescFinal, maxLength);
      
    case 'blog':
      const blogDesc = data.page_description || data.description || data.excerpt || '';
      return truncateString(blogDesc, maxLength);
      
    case 'category':
      const categoryDesc = data.description || '';
      if (!categoryDesc) {
        return `Find the best ${data.name} coupons, deals, and discounts. Save money on ${data.name} products and services.`;
      }
      return truncateString(categoryDesc, maxLength);
      
    default:
      return truncateString(data.description || 'Discover the best coupons, deals, and discounts. Save money on your favorite brands and services.', maxLength);
  }
}

// Generate Open Graph data
export function generateOpenGraphData(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any, baseUrl: string): any {
  const seoData = {
    ogTitle: generateMetaTitle(type, data),
    ogDescription: generateMetaDescription(type, data),
    ogType: 'website',
    ogImage: data.coupon_image?.url || data.logo?.url || data.featured_image?.url || `${baseUrl}/default-og-image.jpg`,
    ogUrl: `${baseUrl}/${getSlugForType(type, data)}`,
  };
  
  return seoData;
}

// Generate Twitter Card data
export function generateTwitterCardData(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any): any {
  return {
    twitterCard: 'summary_large_image',
    twitterTitle: generateMetaTitle(type, data),
    twitterDescription: generateMetaDescription(type, data),
    twitterImage: data.coupon_image?.url || data.logo?.url || data.featured_image?.url,
  };
}

// Generate structured data (JSON-LD)
export function generateStructuredData(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any, baseUrl: string): any {
  switch (type) {
    case 'coupon':
      return {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        name: data.coupon_title || data.title,
        description: generateMetaDescription(type, data),
        url: `${baseUrl}/coupon/${data.slug}`,
        image: data.coupon_image?.url,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'TWD',
          availability: data.coupon_status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          validFrom: data.createdAt,
          validThrough: data.coupon_expiry || data.expiration_date,
        },
        seller: {
          '@type': 'Organization',
          name: data.merchant?.merchant_name || data.merchant_name,
          url: `${baseUrl}/shop/${data.merchant?.slug || data.merchant_slug}`,
        }
      };
      
    case 'merchant':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.merchant_name || data.title,
        description: generateMetaDescription(type, data),
        url: `${baseUrl}/shop/${data.slug}`,
        logo: data.logo?.url,
        address: data.address ? {
          '@type': 'PostalAddress',
          streetAddress: data.address,
          addressLocality: data.city,
          addressRegion: data.region,
          postalCode: data.postal_code,
          addressCountry: 'TW'
        } : undefined,
        contactPoint: data.phone ? {
          '@type': 'ContactPoint',
          telephone: data.phone,
          contactType: 'customer service'
        } : undefined
      };
      
    case 'blog':
      return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title || data.blog_title,
        description: generateMetaDescription(type, data),
        author: {
          '@type': 'Person',
          name: data.author || 'Dealy TW Team'
        },
        datePublished: data.publishedAt || data.publish_date,
        dateModified: data.updatedAt,
        image: data.featured_image?.url,
        url: `${baseUrl}/blog/${data.slug}`,
        publisher: {
          '@type': 'Organization',
          name: 'Dealy TW',
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`
          }
        }
      };
      
    case 'category':
      return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: data.name || data.category_name,
        description: generateMetaDescription(type, data),
        url: `${baseUrl}/category/${data.slug}`,
        mainEntity: {
          '@type': 'ItemList',
          name: `${data.name} Coupons and Deals`
        }
      };
      
    default:
      return null;
  }
}

// Generate breadcrumb structured data
export function generateBreadcrumbData(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any, baseUrl: string): any {
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: baseUrl
    }
  ];
  
  switch (type) {
    case 'coupon':
      breadcrumbs.push(
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Coupons',
          item: `${baseUrl}/coupons`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.merchant?.merchant_name || data.merchant_name,
          item: `${baseUrl}/shop/${data.merchant?.slug || data.merchant_slug}`
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: data.coupon_title || data.title,
          item: `${baseUrl}/coupon/${data.slug}`
        }
      );
      break;
      
    case 'merchant':
      if (data.categories?.[0]) {
        breadcrumbs.push(
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: `${baseUrl}/categories`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: data.categories[0].name,
            item: `${baseUrl}/category/${data.categories[0].slug}`
          }
        );
      }
      breadcrumbs.push({
        '@type': 'ListItem',
        position: data.categories?.[0] ? 4 : 2,
        name: data.merchant_name || data.title,
        item: `${baseUrl}/shop/${data.slug}`
      });
      break;
      
    case 'blog':
      breadcrumbs.push(
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: `${baseUrl}/blog`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: data.title || data.blog_title,
          item: `${baseUrl}/blog/${data.slug}`
        }
      );
      break;
      
    case 'category':
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 2,
        name: data.name || data.category_name,
        item: `${baseUrl}/category/${data.slug}`
      });
      break;
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
  };
}

// Helper function to get slug for URL generation
function getSlugForType(type: 'coupon' | 'merchant' | 'blog' | 'category', data: any): string {
  switch (type) {
    case 'coupon':
      return `coupon/${data.slug}`;
    case 'merchant':
      return `shop/${data.slug}`;
    case 'blog':
      return `blog/${data.slug}`;
    case 'category':
      return `category/${data.slug}`;
    default:
      return '';
  }
}

// Helper function to truncate strings
function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Generate complete SEO data for a content type
export function generateCompleteSeoData(
  type: 'coupon' | 'merchant' | 'blog' | 'category', 
  data: any, 
  baseUrl: string
): SeoData {
  const title = generateMetaTitle(type, data);
  const description = generateMetaDescription(type, data);
  const ogData = generateOpenGraphData(type, data, baseUrl);
  const twitterData = generateTwitterCardData(type, data);
  const structuredData = generateStructuredData(type, data, baseUrl);
  const breadcrumbData = generateBreadcrumbData(type, data, baseUrl);
  
  return {
    title,
    description,
    ...ogData,
    ...twitterData,
    canonicalUrl: ogData.ogUrl,
    structuredData: {
      main: structuredData,
      breadcrumb: breadcrumbData
    }
  };
}
