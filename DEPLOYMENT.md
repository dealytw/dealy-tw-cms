# 🚀 Strapi CMS Deployment Guide - Singapore

## 📋 Prerequisites
- Node.js 18+ installed
- Git repository access
- DigitalOcean account (recommended for Singapore)
- Domain name (optional)

## 🌏 Singapore Deployment (Optimal for ISR)

### Why Singapore?
- **Central Asia location** - Excellent connectivity to TW, HK, KR, JP
- **Fast ISR regeneration** - Closer to your target markets
- **Low latency** for content updates
- **Future-proof** - Perfect for Asia expansion

### Step 1: Generate Security Keys
```bash
# Generate App Keys (run 4 times)
openssl rand -base64 32

# Generate JWT Secret
openssl rand -base64 32

# Generate API Token Salt
openssl rand -base64 32

# Generate Transfer Token Salt
openssl rand -base64 32
```

### Step 2: Set Up Environment Variables
1. Copy `env.example` to `.env`
2. Update with your actual values:
   ```bash
   # Database (Singapore)
   DATABASE_URL=postgresql://username:password@sg-db-host:5432/database
   
   # Security
   APP_KEYS=key1,key2,key3,key4
   ADMIN_JWT_SECRET=your-generated-jwt-secret
   API_TOKEN_SALT=your-generated-api-token-salt
   TRANSFER_TOKEN_SALT=your-generated-transfer-token-salt
   
   # Server
   HOST=0.0.0.0
   PORT=1337
   NODE_ENV=production
   ```

### Step 3: Singapore Infrastructure Setup

#### Option A: DigitalOcean Singapore (Recommended)
1. **Create Account**: https://digitalocean.com
2. **Create Droplet**:
   - **Region**: Singapore 1 (SGP1)
   - **Size**: $24/month (4GB RAM, 2 CPUs)
   - **OS**: Ubuntu 22.04 LTS
   - **Additional**: Managed Database (PostgreSQL)

#### Option B: Railway (Easier)
1. **Create Account**: https://railway.app
2. **Deploy from GitHub**:
   - Connect your repository
   - Railway automatically deploys to optimal region

### Step 4: Database Setup (Singapore)

#### DigitalOcean Managed Database:
```bash
# Create PostgreSQL cluster
# Region: Singapore 1 (SGP1)
# Version: PostgreSQL 15
# Size: $15/month (1GB RAM)
# Benefits: Automatic backups, monitoring, scaling
```

#### Railway PostgreSQL:
- Automatically configured in Singapore region
- Connection string provided automatically

### Step 5: Deployment Process

#### For DigitalOcean Singapore:

```bash
# 1. Connect to your Singapore droplet
ssh root@your-singapore-droplet-ip

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 3. Install PM2 for process management
npm install -g pm2

# 4. Clone your repository
git clone https://github.com/yourusername/dealy-tw-cms.git
cd dealy-tw-cms

# 5. Install dependencies
npm install

# 6. Create .env file with Singapore database values
nano .env

# 7. Build the project
npm run build

# 8. Start with PM2 (keeps running after SSH disconnect)
pm2 start npm --name "strapi" -- start
pm2 startup
pm2 save
```

#### For Railway:
1. **Connect GitHub Repository**
2. **Add Environment Variables** (from your .env)
3. **Deploy Automatically** (Railway handles everything)

### Step 6: Verify Singapore Deployment

#### Test Your CMS:
1. **Access Admin Panel**: `http://your-singapore-ip:1337/admin`
2. **Create First Admin User**
3. **Test Health Check**: `http://your-singapore-ip:1337/api/health`
4. **Test Coupon Creation**
5. **Verify ISR Performance** (should be fast for Asia)

### Step 7: Domain & SSL Setup

#### Set up Custom Domain:
1. **Point DNS** to your Singapore server IP
2. **Install SSL Certificate**:
   ```bash
   # Using Certbot (Let's Encrypt)
   snap install --classic certbot
   certbot --nginx
   ```

## 🔄 Future Migration Path

### When You Move to Asia:
- **CMS already in Singapore** ✅
- **No migration needed** ✅
- **Just update DNS** if you get a custom domain
- **Perfect performance** for local editing

### If You Move Back to UK:
- **Keep Singapore CMS** (better for users)
- **Use Cloudflare** for UK editor performance
- **Consider UK read replica** for faster editing

## 📊 Performance Expectations

### Editor Experience (UK):
- **Latency**: ~200-250ms (acceptable for CMS editing)
- **Admin Panel**: Responsive, slight delay
- **Content Updates**: Fast processing

### User Experience (Asia):
- **Page Loads**: Lightning fast (<500ms)
- **ISR Regeneration**: Very fast (local processing)
- **SEO Performance**: Excellent (local hosting)
- **Core Web Vitals**: Perfect scores

## 🚨 Troubleshooting

### Common Issues:
- **Database Connection**: Verify Singapore database credentials
- **Port Access**: Ensure port 1337 is open
- **Memory Issues**: Increase Node.js memory limit
- **Performance**: Monitor with health check endpoint

### Commands:
```bash
# Check logs
pm2 logs strapi

# Restart service
pm2 restart strapi

# Check status
pm2 status

# Health check
curl http://localhost:1337/api/health
```

## 📞 Support
- Strapi documentation: https://docs.strapi.io/
- Community forum: https://forum.strapi.io/
- GitHub issues: https://github.com/strapi/strapi/issues

## 🎯 Next Steps

1. **Choose hosting provider** (DigitalOcean Singapore or Railway)
2. **Generate security keys**
3. **Set up Singapore database**
4. **Deploy and test**
5. **Configure domain and SSL**

**Ready to start with Singapore deployment?**
