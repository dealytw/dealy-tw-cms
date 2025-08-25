# SEO Schema Implementation for Dealy.tw CMS

This implementation provides automatic SEO schema generation for merchant pages, replicating the functionality from the WordPress site.

## 🏗️ **Architecture Overview**

### **Global Merchant Fields** (Top Level)
- **`auto_seo_enabled`** - Global toggle for automatic SEO generation
- **`page_approach`** - Page layout choice: `coupon_page`, `blog_page`, or `both`

### **Unified Field Structure**
All fields are directly on the merchant entity. The frontend determines which fields to display based on `page_approach`:

- **`page_title`** - Page title for both page types
- **`page_description`** - Page description for both page types
- **`short_intro`** - Short introduction (coupon page)
- **`how_to_use`** - How to use coupons (coupon page)
- **`blog_intro`** - Blog introduction (blog page)
- **`full_blog_content`** - Full blog content (blog page)
- **`faq`** - FAQ section (both page types)

## 🎯 **Key Features**

### **1. Global SEO Toggle**
- **`auto_seo_enabled = true`**: SEO generates automatically from merchant data
- **`auto_seo_enabled = false`**: Use manual SEO fields (`seo_title`, `seo_description`)

### **2. Page Layout Choice**
- **`coupon_page`**: Only coupon page layout
- **`blog_page`**: Only blog page layout  
- **`both`**: Both page layouts (default)

### **3. Frontend Field Selection**
The frontend automatically selects which fields to display based on `page_approach`:
- **Coupon page**: `short_intro`, `how_to_use`, `faq`
- **Blog page**: `blog_intro`, `full_blog_content`, `faq`
- **Both**: All fields available

## 📁 **File Structure**

```
src/
├── api/merchant/
│   ├── content-types/merchant/schema.json     # All fields directly on merchant
│   ├── controllers/merchant.ts                 # SEO schema generation
│   └── routes/custom.ts                       # Custom API endpoint
├── components/merchant/
│   └── faq.json                              # FAQ component only
└── utils/
    ├── seo-schema.ts                          # Frontend utilities
    └── useSeoSchema.ts                        # React hooks
```

## 🚀 **Usage Examples**

### **Frontend Integration**
```typescript
import { useMerchantSeoSchema } from '../utils/useSeoSchema';

function MerchantPage({ merchantId }) {
  const { schema, loading, error } = useMerchantSeoSchema(merchantId);
  
  useEffect(() => {
    if (schema) {
      injectSeoSchema(schema);
    }
  }, [schema]);
  
  // ... rest of component
}
```

### **API Endpoint**
```bash
GET /api/merchants/{id}/seo-schema
```

## 🔧 **Configuration**

### **Merchant Schema**
```json
{
  "auto_seo_enabled": true,           // Global SEO toggle
  "page_approach": "both",            // Page layout choice
  "merchant_name": "Store Name",
  "page_title": "Page Title",
  "page_description": "Page Description",
  "short_intro": "Short intro for coupon page",
  "how_to_use": "How to use coupons",
  "blog_intro": "Blog introduction",
  "full_blog_content": "Full blog content",
  "faq": [...]
}
```

## 🌟 **Generated Schema Structure**

The system generates a comprehensive `@graph` containing:

1. **Organization** - Merchant information
2. **Store** - Store-specific details
3. **ItemList** - Available coupons/deals
4. **WebSite** - Dealy.tw website info
5. **WebPage** - Page-specific SEO data
6. **FAQPage** - FAQ schema (when available)

## 🔄 **WordPress Comparison**

| WordPress Feature | Strapi Equivalent |
|------------------|-------------------|
| `add_action('wp_head')` | Custom API endpoint + frontend injection |
| ACF Repeaters | Direct component fields |
| Dynamic content | Conditional logic based on `auto_seo_enabled` |
| Manual SEO fields | `seo_title`, `seo_description` |

## 📋 **Next Steps**

1. **Add Rating Fields**: Include `rating` and `review_count` in merchant schema
2. **HowTo Detection**: Implement content parsing for automatic HowTo detection
3. **Frontend Integration**: Implement actual DOM manipulation for `injectSeoSchema`
4. **Testing**: Validate schema with Google's Rich Results Test
5. **Performance**: Add caching for schema generation

## 🎯 **Testing**

1. **Go to Admin Panel**: `http://localhost:1337/admin`
2. **Create/Edit a Merchant** with the new structure
3. **Test the Toggle System**:
   - **Toggle ON**: SEO generates automatically
   - **Toggle OFF**: Fill in manual SEO fields
4. **Test the Endpoint**: `/api/merchants/{id}/seo-schema`
5. **Verify Schema**: Check generated JSON-LD structure
