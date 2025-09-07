# Strapi CMS Environment Variables Template
# Copy this to dealy-tw-cms/.env

# Where Strapi runs
HOST=0.0.0.0
PORT=1337

# App keys (comma-separated) - Generate 4 random strings
APP_KEYS=key1,key2,key3,key4

# API Token Salt - Generate a random string
API_TOKEN_SALT=your-api-token-salt-here

# Admin JWT Secret - Generate a random string
ADMIN_JWT_SECRET=your-admin-jwt-secret-here

# Transfer Token Salt - Generate a random string
TRANSFER_TOKEN_SALT=your-transfer-token-salt-here

# Encryption Key - Generate a random string
ENCRYPTION_KEY=your-encryption-key-here

# Allow your Next dev origin for CORS
CORS_ORIGIN=http://localhost:3000

# Database (if using SQLite for development)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# JWT Secret - Generate a random string
JWT_SECRET=your-jwt-secret-here

# Instructions:
# 1. Copy this content to dealy-tw-cms/.env
# 2. Replace all "your-*-here" values with actual random strings
# 3. Generate secure random strings for all secrets
# 4. Start Strapi: npm run develop
# 5. Create API token in Strapi Admin → Settings → API Tokens
