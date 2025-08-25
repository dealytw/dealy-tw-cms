/**
 * Utility functions for generating merchant URLs
 */

export interface MerchantPageSetup {
  page_approach: 'coupon_page' | 'blog_page' | 'both';
  coupon_page_config?: {
    custom_slug?: string;
    is_active: boolean;
  };
  blog_page_config?: {
    custom_slug?: string;
    url_suffix?: string;
    is_active: boolean;
  };
}

export interface Merchant {
  slug: string;
  page_setup: MerchantPageSetup;
  logo?: any;
}

/**
 * Generate coupon page URL for a merchant
 */
export function generateCouponPageUrl(merchant: Merchant): string | null {
  if (!merchant.page_setup?.coupon_page_config?.is_active) {
    return null;
  }
  
  const customSlug = merchant.page_setup.coupon_page_config.custom_slug || 'shop';
  return `dealy.tw/${customSlug}/${merchant.slug}`;
}

/**
 * Generate blog page URL for a merchant
 */
export function generateBlogPageUrl(merchant: Merchant): string | null {
  if (!merchant.page_setup?.blog_page_config?.is_active) {
    return null;
  }
  
  const customSlug = merchant.page_setup.blog_page_config.custom_slug || 'blog';
  const urlSuffix = merchant.page_setup.blog_page_config.url_suffix || 'promo-code';
  return `dealy.tw/${customSlug}/${merchant.slug}-${urlSuffix}`;
}

/**
 * Get all active page URLs for a merchant
 */
export function getMerchantUrls(merchant: Merchant) {
  const urls: { couponPage?: string; blogPage?: string } = {};
  
  if (merchant.page_setup?.coupon_page_config?.is_active) {
    urls.couponPage = generateCouponPageUrl(merchant);
  }
  
  if (merchant.page_setup?.blog_page_config?.is_active) {
    urls.blogPage = generateBlogPageUrl(merchant);
  }
  
  return urls;
}

/**
 * Get the primary URL for a merchant based on page approach
 */
export function getPrimaryMerchantUrl(merchant: Merchant): string | null {
  const urls = getMerchantUrls(merchant);
  
  switch (merchant.page_setup.page_approach) {
    case 'coupon_page':
      return urls.couponPage || null;
    case 'blog_page':
      return urls.blogPage || null;
    case 'both':
      // Default to coupon page if both are available
      return urls.couponPage || urls.blogPage || null;
    default:
      return null;
  }
}

/**
 * Check if a merchant has active pages
 */
export function hasActivePages(merchant: Merchant): boolean {
  return !!(merchant.page_setup?.coupon_page_config?.is_active || 
           merchant.page_setup?.blog_page_config?.is_active);
}
