# 🚀 Singapore Deployment Checklist

## ✅ Pre-Deployment (Do This First)

### 1. Generate Security Keys
```bash
# Run these commands and save each result
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Create .env File
```bash
# Copy env.example to .env
cp env.example .env

# Update with your actual values
nano .env
```

## 🌏 Singapore Infrastructure

### Option A: DigitalOcean Singapore
- [ ] Create DigitalOcean account
- [ ] Create Droplet in Singapore 1 (SGP1)
- [ ] Choose $24/month plan (4GB RAM, 2 CPUs)
- [ ] Select Ubuntu 22.04 LTS
- [ ] Create Managed Database (PostgreSQL) in Singapore

### Option B: Railway (Easier)
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Add PostgreSQL service
- [ ] Configure environment variables

## 🗄️ Database Setup

### DigitalOcean Database
- [ ] Create PostgreSQL cluster in Singapore 1
- [ ] Choose $15/month plan (1GB RAM)
- [ ] Save connection string
- [ ] Test connection locally

### Railway Database
- [ ] Database automatically created
- [ ] Copy connection string from Railway dashboard

## ⚙️ Environment Configuration

### Required Variables
- [ ] `DATABASE_URL` (Singapore database)
- [ ] `APP_KEYS` (4 generated keys)
- [ ] `ADMIN_JWT_SECRET` (generated)
- [ ] `API_TOKEN_SALT` (generated)
- [ ] `TRANSFER_TOKEN_SALT` (generated)
- [ ] `NODE_ENV=production`

## 🚀 Deployment

### DigitalOcean Commands
```bash
# Connect to server
ssh root@your-singapore-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone and setup
git clone https://github.com/yourusername/dealy-tw-cms.git
cd dealy-tw-cms
npm install
nano .env  # Add your environment variables
npm run build
pm2 start npm --name "strapi" -- start
pm2 startup
pm2 save
```

### Railway
- [ ] Push code to GitHub
- [ ] Railway auto-deploys
- [ ] Check deployment status

## 🔍 Verification

### Test Your CMS
- [ ] Admin panel accessible: `http://ip:1337/admin`
- [ ] Health check working: `http://ip:1337/api/health`
- [ ] Create admin user
- [ ] Test coupon creation
- [ ] Verify database connection

### Performance Check
- [ ] Admin panel responsive (UK editing)
- [ ] Health check returns healthy status
- [ ] No database connection errors
- [ ] PM2 process running

## 🔧 Post-Deployment

### Optional Setup
- [ ] Configure custom domain
- [ ] Install SSL certificate
- [ ] Set up Cloudflare CDN
- [ ] Configure monitoring

### Monitoring Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs strapi

# Restart if needed
pm2 restart strapi

# Health check
curl http://localhost:1337/api/health
```

## 🎯 Success Criteria

- [ ] CMS accessible from Singapore server
- [ ] Database connected and working
- [ ] Admin panel functional
- [ ] Health check endpoint healthy
- [ ] PM2 process management working
- [ ] Ready for content creation

## 🚨 Troubleshooting

### Common Issues
- **Port 1337 blocked**: Check firewall settings
- **Database connection failed**: Verify credentials and network
- **Memory issues**: Increase Node.js memory limit
- **Process not starting**: Check PM2 logs

### Quick Fixes
```bash
# Restart everything
pm2 delete all
pm2 start npm --name "strapi" -- start
pm2 startup
pm2 save

# Check logs
pm2 logs strapi
```

---

**🎉 Ready to deploy to Singapore!**
