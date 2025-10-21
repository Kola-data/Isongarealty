# VPS Production Setup Guide

## 🚀 Redis Installation & Configuration

### 1. Install Redis on Ubuntu/Debian
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Redis
sudo apt install redis-server -y

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Check Redis status
sudo systemctl status redis-server
```

### 2. Configure Redis for Production
```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf
```

**Key Configuration Changes:**
```conf
# Security
bind 127.0.0.1
protected-mode yes
requirepass your_strong_redis_password_here

# Memory Management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Network
timeout 300
tcp-keepalive 300
```

### 3. Secure Redis
```bash
# Create Redis user
sudo useradd -r -s /bin/false redis

# Set proper permissions
sudo chown redis:redis /var/lib/redis
sudo chmod 750 /var/lib/redis

# Restart Redis
sudo systemctl restart redis-server
```

## 🔧 Nginx Configuration

### 1. Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Configure Nginx for Node.js App
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/isonga-realty
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Frontend (React/Vite)
    location / {
        root /var/www/isonga-realty/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads directory
    location /uploads/ {
        alias /var/www/isonga-realty/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

### 3. Enable Site
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/isonga-realty /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🐳 Docker Setup (Alternative)

### 1. Install Docker
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y
```

### 2. Docker Compose Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: isonga-redis
    restart: unless-stopped
    ports:
      - "127.0.0.1:6379:6379"
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    environment:
      - REDIS_PASSWORD=your_strong_password

  app:
    build: ./backend
    container_name: isonga-backend
    restart: unless-stopped
    ports:
      - "3200:3200"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - REDIS_PASSWORD=your_strong_password
    depends_on:
      - redis
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    container_name: isonga-frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    depends_on:
      - app

volumes:
  redis_data:
```

## 📦 Application Deployment

### 1. Create Deployment Script
```bash
# Create deployment script
nano deploy.sh
```

```bash
#!/bin/bash

# Deployment script for Isonga Realty
set -e

echo "🚀 Starting deployment..."

# Variables
APP_DIR="/var/www/isonga-realty"
BACKUP_DIR="/var/backups/isonga-realty"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
echo "📦 Creating backup..."
sudo mkdir -p $BACKUP_DIR
sudo tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" -C $APP_DIR .

# Stop services
echo "⏹️ Stopping services..."
sudo systemctl stop isonga-backend || true
sudo systemctl stop isonga-frontend || true

# Update code
echo "📥 Updating code..."
cd $APP_DIR
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
npm ci --production
cd ../frontend
npm ci
npm run build

# Start services
echo "▶️ Starting services..."
sudo systemctl start isonga-backend
sudo systemctl start isonga-frontend

# Health check
echo "🔍 Health check..."
sleep 10
curl -f http://localhost:3200/health || exit 1

echo "✅ Deployment completed successfully!"
```

### 2. Systemd Services

**Backend Service:**
```bash
sudo nano /etc/systemd/system/isonga-backend.service
```

```ini
[Unit]
Description=Isonga Realty Backend
After=network.target redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/isonga-realty/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=REDIS_URL=redis://127.0.0.1:6379
Environment=REDIS_PASSWORD=your_redis_password

[Install]
WantedBy=multi-user.target
```

**Frontend Service:**
```bash
sudo nano /etc/systemd/system/isonga-frontend.service
```

```ini
[Unit]
Description=Isonga Realty Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/isonga-realty/frontend
ExecStart=/usr/bin/npx serve -s dist -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 3. Enable Services
```bash
# Enable services
sudo systemctl enable isonga-backend
sudo systemctl enable isonga-frontend

# Start services
sudo systemctl start isonga-backend
sudo systemctl start isonga-frontend

# Check status
sudo systemctl status isonga-backend
sudo systemctl status isonga-frontend
```

## 🔍 Monitoring & Logs

### 1. Redis Monitoring
```bash
# Redis CLI
redis-cli -a your_password

# Monitor Redis
redis-cli -a your_password monitor

# Check memory usage
redis-cli -a your_password info memory
```

### 2. Application Logs
```bash
# Backend logs
sudo journalctl -u isonga-backend -f

# Frontend logs
sudo journalctl -u isonga-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Performance Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor Redis
redis-cli -a your_password --latency-history

# Monitor system
htop
```

## 🛡️ Security Hardening

### 1. Firewall Configuration
```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Redis Security
```bash
# Disable dangerous commands
echo "rename-command FLUSHDB \"\"" >> /etc/redis/redis.conf
echo "rename-command FLUSHALL \"\"" >> /etc/redis/redis.conf
echo "rename-command CONFIG \"\"" >> /etc/redis/redis.conf

# Restart Redis
sudo systemctl restart redis-server
```

### 3. Application Security
```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/isonga-realty
sudo chmod -R 755 /var/www/isonga-realty

# Secure uploads directory
sudo chmod 755 /var/www/isonga-realty/backend/uploads
```

## 📊 Environment Variables

Create production environment file:
```bash
sudo nano /var/www/isonga-realty/backend/.env
```

```env
# Production Environment
NODE_ENV=production
PORT=3200

# Database
DB_PATH=/var/www/isonga-realty/backend/isonga_real_estate_db.db

# Redis
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=your_strong_redis_password
REDIS_PREFIX=isonga
CACHE_TTL=300

# JWT
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/isonga-realty/backend/uploads
```

## 🚀 Deployment Checklist

- [ ] Redis installed and configured
- [ ] Nginx installed and configured
- [ ] SSL certificate installed
- [ ] Application deployed
- [ ] Systemd services configured
- [ ] Firewall configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Health checks working
- [ ] Performance optimized

## 🔧 Troubleshooting

### Common Issues:

1. **Redis Connection Failed**
   ```bash
   # Check Redis status
   sudo systemctl status redis-server
   
   # Check Redis logs
   sudo tail -f /var/log/redis/redis-server.log
   ```

2. **Nginx 502 Bad Gateway**
   ```bash
   # Check backend service
   sudo systemctl status isonga-backend
   
   # Check backend logs
   sudo journalctl -u isonga-backend -f
   ```

3. **SSL Certificate Issues**
   ```bash
   # Renew certificate
   sudo certbot renew --dry-run
   ```

This setup provides a production-ready environment with Redis caching, Nginx reverse proxy, SSL security, and proper monitoring.
