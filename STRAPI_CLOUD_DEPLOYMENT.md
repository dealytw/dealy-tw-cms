# 🚀 Strapi Cloud Deployment Guide

## Overview
Deploy your dealy.tw CMS to Strapi Cloud for the simplest, most reliable hosting experience.

## 🎯 Why Strapi Cloud?
- **Zero server management** - No Docker, Nginx, or server setup
- **Built for Strapi** - Optimized specifically for your CMS
- **Automatic scaling** - Handles traffic spikes automatically
- **Global CDN** - Fast performance worldwide
- **Automatic backups** - Your data is always safe

## 📋 Prerequisites
- GitHub account with your project repository
- Strapi Cloud account (sign up at https://cloud.strapi.io)

## 🚀 Deployment Steps

### 1. Prepare Your Project
Your project is already ready! It's using:
- SQLite for local development
- Standard Strapi v5 configuration
- Custom admin pages (Dashboard, Coupon Editor, Search Analytics)

### 2. Sign Up for Strapi Cloud
1. Go to https://cloud.strapi.io
2. Click "Get Started"
3. Sign in with GitHub
4. Choose your plan (Starter: $99/month)

### 3. Connect Your Repository
1. Click "Create new project"
2. Select your `dealy-tw-cms` repository
3. Choose the main branch
4. Click "Deploy"

### 4. Configure Environment Variables
Strapi Cloud will automatically detect your project and set up:
- Database (managed PostgreSQL)
- File storage
- Admin panel
- API endpoints

### 5. Set Up Permissions (Important!)
After deployment, you need to configure permissions:
1. Go to your Strapi Cloud admin panel
2. Navigate to **Settings** → **Users & Permissions Plugin** → **Roles**
3. Click on **Public** role
4. Enable these permissions for **Coupon**:
   - ✅ `find` (read)
   - ✅ `findOne` (read)
   - ✅ `create` (create)
   - ✅ `update` (update)
   - ✅ `delete` (delete)
5. Enable these permissions for **Merchant**:
   - ✅ `find` (read)
   - ✅ `findOne` (read)
6. Click **Save**

### 6. Access Your CMS
- **Admin Panel**: `https://your-project.strapiapp.com/admin`
- **API**: `https://your-project.strapiapp.com/api/*`

## 🌐 Multi-Domain Setup

### For Future Frontends
When you're ready to deploy frontends to different domains:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   dealy.com     │    │   dealy.hk      │    │   dealy.sg      │
│   (Frontend)    │    │   (Frontend)    │    │   (Frontend)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Strapi Cloud  │
                    │   (CMS + API)   │
                    └─────────────────┘
```

### API Integration
Each frontend will connect to your Strapi Cloud API:
```javascript
// Frontend code
const response = await fetch('https://your-project.strapiapp.com/api/coupons');
const coupons = await response.json();
```

## 💰 Cost Breakdown
- **Strapi Cloud Starter**: $99/month
- **Includes**: Hosting, database, file storage, CDN, backups
- **No additional costs** for database or server management

## ✅ Benefits Over Other Solutions
| Feature | Strapi Cloud | DigitalOcean | Vercel |
|---------|--------------|--------------|---------|
| **Setup Time** | 5 minutes | 2+ hours | 30 minutes |
| **Maintenance** | Zero | High | Medium |
| **Strapi Optimized** | ✅ Yes | ❌ No | ❌ No |
| **Auto-scaling** | ✅ Yes | ❌ No | ✅ Yes |
| **Backups** | ✅ Automatic | ❌ Manual | ❌ No |

## 🔧 Next Steps
1. **Deploy to Strapi Cloud** (5 minutes)
2. **Test your admin panel** at the new URL
3. **Start building frontends** when ready
4. **Connect domains** as needed

## 🔧 Troubleshooting

### 403 Forbidden Errors
If you see "HTTP 403: Forbidden" errors:
1. **Check permissions**: Make sure you've set up the Public role permissions (step 5)
2. **Verify API endpoints**: Your custom API routes are now included
3. **Check Strapi Cloud logs**: Use the Strapi Cloud dashboard to view logs

### Common Issues
- **Coupon Editor not loading**: Usually a permissions issue - follow step 5
- **API calls failing**: Ensure the Public role has the right permissions
- **Database connection**: Strapi Cloud handles this automatically

## 📞 Support
- Strapi Cloud includes priority support
- No need to troubleshoot server issues
- Focus on building your business, not managing infrastructure

---

**Ready to deploy?** Your project is already optimized for Strapi Cloud! 🎉
