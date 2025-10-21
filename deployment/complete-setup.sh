#!/bin/bash

# Complete Setup Script for Isonga Realty Application
# This script sets up Nginx, Redis, and the backend service

set -e

echo "🚀 Complete Setup for Isonga Realty Application"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Step 1: Install required packages
print_status "Step 1: Installing required packages..."
sudo apt update
sudo apt install -y nginx redis-server nodejs npm certbot python3-certbot-nginx ufw

# Step 2: Configure Redis
print_status "Step 2: Configuring Redis..."
sudo cp redis.conf /etc/redis/redis.conf

# Generate secure Redis password
REDIS_PASSWORD=$(openssl rand -base64 32)
sudo sed -i "s/your_redis_password_here/$REDIS_PASSWORD/g" /etc/redis/redis.conf

# Create Redis directories
sudo mkdir -p /var/log/redis
sudo chown redis:redis /var/log/redis

# Step 3: Configure Nginx
print_status "Step 3: Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/isongarealty
sudo ln -sf /etc/nginx/sites-available/isongarealty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Step 4: Create application directories
print_status "Step 4: Creating application directories..."
sudo mkdir -p /var/www/isongarealty/{frontend,backend,backend/uploads}
sudo chown -R $USER:$USER /var/www/isongarealty

# Step 5: Setup systemd services
print_status "Step 5: Setting up systemd services..."

# Update Redis password in backend service
sudo cp backend.service /etc/systemd/system/isongarealty-backend.service
sudo sed -i "s/your_redis_password_here/$REDIS_PASSWORD/g" /etc/systemd/system/isongarealty-backend.service

# Copy Redis service
sudo cp redis.service /etc/systemd/system/redis.service

# Step 6: Configure firewall
print_status "Step 6: Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Step 7: Start services
print_status "Step 7: Starting services..."
sudo systemctl daemon-reload
sudo systemctl enable nginx redis-server isongarealty-backend
sudo systemctl restart nginx redis-server

# Step 8: Create deployment scripts
print_status "Step 8: Creating deployment scripts..."

# Create main deployment script
cat > deploy.sh << EOF
#!/bin/bash

# Deployment script for Isonga Realty Application

set -e

echo "🚀 Deploying Isonga Realty Application..."

# Build frontend
echo "Building frontend..."
cd frontend
npm run build:prod
sudo cp -r dist/* /var/www/isongarealty/frontend/

# Copy backend files
echo "Copying backend files..."
cd ../backend
sudo cp -r . /var/www/isongarealty/backend/
sudo chown -R www-data:www-data /var/www/isongarealty/backend

# Install backend dependencies
echo "Installing backend dependencies..."
cd /var/www/isongarealty/backend
sudo -u www-data npm install --production

# Restart services
echo "Restarting services..."
sudo systemctl restart isongarealty-backend
sudo systemctl restart nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: https://isongarealty.com"
echo "🔧 Backend API: https://isongarealty.com/api"
echo "📊 Redis: localhost:6379"
EOF

chmod +x deploy.sh

# Create SSL setup script
cat > setup-ssl.sh << 'EOF'
#!/bin/bash

# SSL Setup Script for Isonga Realty

echo "🔒 Setting up SSL certificates..."

# Replace with your actual domain
DOMAIN="isongarealty.com"
EMAIL="admin@isongarealty.com"

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Setup auto-renewal
echo "Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

echo "✅ SSL setup completed!"
EOF

chmod +x setup-ssl.sh

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

# Monitoring script for Isonga Realty services

echo "📊 Isonga Realty Service Status"
echo "================================"

# Check Nginx
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Running"
else
    echo "❌ Nginx: Not running"
fi

# Check Redis
if systemctl is-active --quiet redis-server; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not running"
fi

# Check Backend
if systemctl is-active --quiet isongarealty-backend; then
    echo "✅ Backend: Running"
else
    echo "❌ Backend: Not running"
fi

# Check disk space
echo ""
echo "💾 Disk Usage:"
df -h /var/www/isongarealty

# Check memory usage
echo ""
echo "🧠 Memory Usage:"
free -h

# Check Redis memory
echo ""
echo "🔴 Redis Memory Usage:"
redis-cli info memory | grep used_memory_human

echo ""
echo "🌐 Application URLs:"
echo "Frontend: https://isongarealty.com"
echo "Backend API: https://isongarealty.com/api"
echo "Health Check: https://isongarealty.com/health"
EOF

chmod +x monitor.sh

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash

# Backup script for Isonga Realty Application

BACKUP_DIR="/var/backups/isongarealty"
DATE=$(date +%Y%m%d_%H%M%S)

echo "📦 Creating backup..."

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Backup application files
sudo tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /var/www isongarealty

# Backup Redis data
sudo cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup Nginx configuration
sudo cp /etc/nginx/sites-available/isongarealty $BACKUP_DIR/nginx_$DATE.conf

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.conf" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh

# Step 9: Final configuration
print_status "Step 9: Final configuration..."

# Create log rotation for application
sudo tee /etc/logrotate.d/isongarealty > /dev/null <<EOF
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 640 nginx adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \$(cat /var/run/nginx.pid)
        fi
    endscript
}
EOF

# Create cron job for backups
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -

print_success "Complete setup finished successfully!"
print_status "Setup Summary:"
echo "✅ Nginx configured and running"
echo "✅ Redis configured and running"
echo "✅ Systemd services created"
echo "✅ Firewall configured"
echo "✅ Deployment scripts created"
echo "✅ Backup system configured"

print_warning "Important Configuration:"
echo "1. Update Redis password: /etc/redis/redis.conf"
echo "2. Update domain name in setup-ssl.sh"
echo "3. Copy your application files to /var/www/isongarealty/"
echo "4. Run ./deploy.sh to deploy your application"

print_status "Next Steps:"
echo "1. Copy your application files to /var/www/isongarealty/"
echo "2. Run ./deploy.sh to deploy your application"
echo "3. Run ./setup-ssl.sh to configure SSL certificates"
echo "4. Run ./monitor.sh to check service status"

print_status "Service Management:"
echo "sudo systemctl status nginx"
echo "sudo systemctl status redis-server"
echo "sudo systemctl status isongarealty-backend"
echo "sudo systemctl restart nginx"
echo "sudo systemctl restart redis-server"
echo "sudo systemctl restart isongarealty-backend"

print_success "🎉 Setup completed! Your Isonga Realty application is ready for deployment!"
