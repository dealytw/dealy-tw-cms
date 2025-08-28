# Merchant Page Setup System

This system allows merchants to configure both coupon page and blog page approaches for their promotional content, with automatic URL generation and flexible configuration options.

## Overview

The system provides two main approaches for merchant pages:
1. **Coupon Page**: `dealy.tw/shop/{merchant}` - Dedicated coupon/deal pages
2. **Blog Page**: `dealy.tw/blog/{merchant}-promo-code` - Blog-style promotional content

## Database Schema Changes

### Merchant Collection
- Added `page_setup` component (required)
- Contains configuration for both page approaches

### New Components Created

#### 1. `merchant.page-setup`
- `page_approach`: Choose between 'coupon_page', 'blog_page', or 'both'
- `coupon_page_config`: Configuration for coupon page
- `blog_page_config`: Configuration for blog page

#### 2. `merchant.coupon-page-config`
- `page_title`: Title for the coupon page
- `page_description`: Description for the page
- `custom_slug`: Custom URL slug (default: 'shop')
- `seo_title`, `seo_description`, `meta_keywords`: SEO fields
- `header_content`, `footer_content`: Custom content blocks
- `is_active`: Enable/disable the page

#### 3. `merchant.blog-page-config`
- `page_title`: Title for the blog page
- `page_description`: Description for the page
- `custom_slug`: Custom URL slug (default: 'blog')
- `url_suffix`: URL suffix (default: 'promo-code')
- `seo_title`, `seo_description`, `meta_keywords`: SEO fields
- `header_content`, `footer_content`: Custom content blocks
- `blog_intro`: Introduction text for the blog
- `is_active`: Enable/disable the page

## API Endpoints

### New Merchant Routes

#### Get Merchant with URLs
```
GET /api/merchants/:id/with-urls
```
Returns merchant with populated page setup and generated URLs.

#### Get All Merchants with URLs
```
GET /api/merchants/with-urls
```
Returns all merchants with their page setup and URLs.

#### Get Merchants by Page Approach
```
GET /api/merchants/by-approach?approach=coupon_page
```
Filter merchants by their page approach strategy.

### Enhanced Coupon Service

#### Get Coupon with Merchant Info
```typescript
const coupon = await strapi.service('api::coupon.coupon').getCouponWithMerchant(id);
```

#### Get All Coupons with Merchant Info
```typescript
const coupons = await strapi.service('api::coupon.coupon').getAllCouponsWithMerchant();
```

#### Get Coupons by Merchant
```typescript
const coupons = await strapi.service('api::coupon.coupon').getCouponsByMerchant(merchantId);
```

## Frontend Usage

### Import Utility Functions
```typescript
import { 
  generateCouponPageUrl, 
  generateBlogPageUrl, 
  getMerchantUrls,
  getPrimaryMerchantUrl 
} from './utils/merchant-urls';
```

### Generate URLs
```typescript
// Get coupon page URL
const couponUrl = generateCouponPageUrl(merchant);
// Result: "dealy.tw/shop/merchant-slug"

// Get blog page URL
const blogUrl = generateBlogPageUrl(merchant);
// Result: "dealy.tw/blog/merchant-slug-promo-code"

// Get all URLs
const urls = getMerchantUrls(merchant);
// Result: { couponPage: "...", blogPage: "..." }

// Get primary URL based on approach
const primaryUrl = getPrimaryMerchantUrl(merchant);
```

### Display Coupon Cards
```typescript
// When displaying coupon cards, use merchant logo
const CouponCard = ({ coupon }) => {
  const merchant = coupon.merchant;
  const merchantUrls = getMerchantUrls(merchant);
  
  return (
    <div className="coupon-card">
      <img src={merchant.logo?.url} alt={merchant.merchant_name} />
      <h3>{coupon.coupon_title}</h3>
      
      {/* Link to merchant page based on approach */}
      {merchantUrls.couponPage && (
        <a href={merchantUrls.couponPage}>View All Deals</a>
      )}
      
      {merchantUrls.blogPage && (
        <a href={merchantUrls.blogPage}>Read More</a>
      )}
    </div>
  );
};
```

## Admin Panel Configuration

### Setting Up Merchant Pages

1. **Edit Merchant** in Strapi admin
2. **Page Setup Section**:
   - Choose `page_approach` (coupon_page, blog_page, or both)
3. **Configure Coupon Page** (if enabled):
   - Set page title and description
   - Customize URL slug (default: 'shop')
   - Add SEO content
   - Configure header/footer content
4. **Configure Blog Page** (if enabled):
   - Set page title and description
   - Customize URL slug (default: 'blog')
   - Set URL suffix (default: 'promo-code')
   - Add SEO content and blog intro

### Example Configuration

#### Coupon Page Only
```json
{
  "page_approach": "coupon_page",
  "coupon_page_config": {
    "page_title": "Shop Deals",
    "custom_slug": "deals",
    "is_active": true
  }
}
```
**Result URL**: `dealy.tw/deals/merchant-slug`

#### Blog Page Only
```json
{
  "page_approach": "blog_page",
  "blog_page_config": {
    "page_title": "Promo Codes Blog",
    "custom_slug": "promos",
    "url_suffix": "codes",
    "is_active": true
  }
}
```
**Result URL**: `dealy.tw/promos/merchant-slug-codes`

#### Both Approaches
```json
{
  "page_approach": "both",
  "coupon_page_config": {
    "page_title": "Shop Deals",
    "is_active": true
  },
  "blog_page_config": {
    "page_title": "Promo Codes Blog",
    "is_active": true
  }
}
```
**Result URLs**: 
- `dealy.tw/shop/merchant-slug`
- `dealy.tw/blog/merchant-slug-promo-code`

## Benefits

1. **Flexible URL Structure**: Customize slugs and suffixes for SEO
2. **Dual Approach Strategy**: Support both coupon pages and blog content
3. **Automatic URL Generation**: No manual URL management needed
4. **SEO Optimization**: Dedicated fields for search engine optimization
5. **Content Management**: Rich content blocks for headers and footers
6. **Merchant Branding**: Coupon cards automatically display merchant logos

## Migration Notes

- Existing merchants will need to have `page_setup` configured
- Default approach is 'both' with default configurations
- All new merchants must have page setup configured
- Backward compatibility maintained for existing coupon-merchant relationships

## Future Enhancements

- Analytics tracking for page performance
- A/B testing for different page approaches
- Dynamic content based on merchant performance
- Integration with external analytics platforms
