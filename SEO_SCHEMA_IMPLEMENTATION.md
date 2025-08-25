# SEO Schema Implementation for Dealy.TW

This document explains how the SEO schema system has been implemented to replicate your WordPress functionality in the Strapi-based site.

## Overview

The system generates JSON-LD structured data (schema.org markup) that matches your WordPress implementation, including:
- **Store/Organization** schemas for merchant pages
- **BlogPosting** schemas for blog/coupon guide pages
- **ItemList** schemas for coupon listings
- **FAQPage** schemas (when FAQ content is available)
- **HowTo** schemas (auto-detected from content structure)

## Architecture

### Backend (Strapi)
- **API Endpoint**: `/api/merchants/:id/seo-schema`
- **Controller**: `merchant.getSeoSchema()` in `src/api/merchant/controllers/merchant.ts`
- **Route**: Custom route added to merchant routes

### Frontend
- **Utility Functions**: `src/utils/seo-schema.ts`
- **React Hooks**: `src/utils/useSeoSchema.ts`
- **Automatic Injection**: JSON-LD scripts are injected into `<head>`

## Usage Examples

### 1. Merchant Pages (Coupon Pages)

```tsx
import { useMerchantSeoSchema } from '../utils/useSeoSchema';

function MerchantPage({ merchantId }: { merchantId: string }) {
  // This will automatically fetch and inject the SEO schema
  useMerchantSeoSchema(merchantId);
  
  return (
    <div>
      {/* Your merchant page content */}
    </div>
  );
}
```

### 2. Blog/Coupon Guide Pages

```tsx
import { useBlogSeoSchema } from '../utils/useSeoSchema';

function BlogPost({ post }: { post: BlogPost }) {
  useBlogSeoSchema({
    title: post.title,
    description: post.description,
    url: post.url,
    publishedDate: post.publishedAt,
    modifiedDate: post.updatedAt,
    author: post.author?.name,
    image: post.featuredImage?.url,
    keywords: post.keywords
  });
  
  return (
    <article>
      {/* Your blog post content */}
    </article>
  );
}
```

### 3. Custom Schema

```tsx
import { useCustomSeoSchema } from '../utils/useSeoSchema';

function CustomPage() {
  const customSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Custom Page",
        "url": "https://dealy.tw/custom"
      }
    ]
  };
  
  useCustomSeoSchema(customSchema);
  
  return <div>Custom page content</div>;
}
```

## Generated Schema Structure

### Merchant Pages
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://merchant-url.com#merchant",
      "name": "Merchant Name",
      "url": "https://merchant-url.com",
      "image": "logo-url",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Hong Kong",
        "addressRegion": "Hong Kong SAR",
        "addressCountry": "HK"
      }
    },
    {
      "@type": "Store",
      "@id": "https://merchant-url.com#store",
      "name": "Merchant Name",
      "url": "https://merchant-url.com"
    },
    {
      "@type": "ItemList",
      "@id": "https://merchant-url.com#coupons",
      "name": "Merchant Name 優惠一覽",
      "itemListElement": [...]
    },
    {
      "@type": "WebSite",
      "@id": "https://dealy.tw#website",
      "name": "Dealy.TW"
    },
    {
      "@type": "WebPage",
      "@id": "https://merchant-url.com",
      "name": "Merchant Name"
    }
  ]
}
```

### Blog Pages
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://dealy.tw#website",
      "name": "Dealy.TW",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://dealy.tw/?s={search_term_string}"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://dealy.tw/blog-post",
      "name": "Blog Post Title"
    },
    {
      "@type": "BlogPosting",
      "@id": "https://dealy.tw/blog-post#article",
      "headline": "Blog Post Title",
      "author": {"@type": "Person", "name": "Author Name"}
    },
    {
      "@type": "Organization",
      "@id": "https://dealy.tw#organization",
      "name": "Dealy.TW"
    }
  ]
}
```

## Configuration

### Environment Variables
```bash
SITE_URL=https://dealy.tw
```

### Strapi Configuration
The system automatically uses the merchant's:
- `merchant_name` for organization/store names
- `site_url` or `canonical_url` for URLs
- `logo` for images
- `page_setup.page_approach` to determine schema types
- `coupons` relation for coupon listings

## Key Features

1. **Automatic Detection**: Schema type is determined by `page_approach` setting
2. **Hong Kong Localization**: Addresses are automatically set to Hong Kong
3. **Coupon Integration**: Active coupons are automatically included in ItemList schema
4. **SEO Optimization**: Follows Google's structured data guidelines
5. **React Integration**: Easy-to-use hooks for React components
6. **Type Safety**: Full TypeScript support

## Comparison with WordPress

| WordPress Function | Strapi Equivalent | Status |
|-------------------|-------------------|---------|
| `dealyhk_single_shop_schema()` | `merchant.getSeoSchema()` | ✅ Implemented |
| `dealyhk_single_blog_schema()` | `generateBlogSeoSchema()` | ✅ Implemented |
| FAQ handling | Via ACF repeaters | 🔄 Needs FAQ content type |
| HowTo detection | Content analysis | 🔄 Needs content parsing |
| Rating/reviews | Merchant fields | 🔄 Needs rating fields |

## Next Steps

1. **Add FAQ Content Type**: Create FAQ fields in merchant configuration
2. **Add Rating Fields**: Include `rating` and `review_count` in merchant schema
3. **HowTo Detection**: Implement content parsing for automatic HowTo detection
4. **Testing**: Validate schema with Google's Rich Results Test
5. **Performance**: Add caching for schema generation

## Testing

Use Google's Rich Results Test to validate the generated schema:
https://search.google.com/test/rich-results

## Troubleshooting

- **Schema not appearing**: Check browser console for fetch errors
- **Type errors**: Ensure merchant ID is valid and API endpoint is accessible
- **Missing data**: Verify merchant has required fields populated
- **SSR issues**: Use dynamic imports in React hooks for client-side only execution
