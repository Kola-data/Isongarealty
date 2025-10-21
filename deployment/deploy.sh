#!/bin/bash

# Isonga Realty Production Deployment Script
# Run this script on your VPS to set up the complete production environment

set -e

echo "🚀 Isonga Realty Production Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/var/www/isonga-realty"
DOMAIN=""
REDIS_PASSWORD=""
JWT_SECRET=""

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Get user input
echo "Please provide the following information:"
read -p "Domain name (e.g., yourdomain.com): " DOMAIN
read -s -p "Redis password (strong password): " REDIS_PASSWORD
echo
read -s -p "JWT secret (strong secret): " JWT_SECRET
echo

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git nginx redis-server certbot python3-certbot-nginx htop iotop nethogs

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
print_status "Installing PM2..."
sudo npm install -g pm2

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone or update repository
if [ -d "$APP_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $APP_DIR
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/your-username/isonga-realty.git $APP_DIR
    cd $APP_DIR
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci --production
cd ..

# Install frontend dependencies and build
print_status "Installing frontend dependencies and building..."
cd frontend
npm ci
npm run build
cd ..

# Configure Redis
print_status "Configuring Redis..."
sudo cp deployment/redis.conf /etc/redis/redis.conf
sudo sed -i "s/your_strong_redis_password_here/$REDIS_PASSWORD/g" /etc/redis/redis.conf
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Create environment file
print_status "Creating environment configuration..."
cat > backend/.env << EOF
NODE_ENV=production
PORT=3200
DB_PATH=$APP_DIR/backend/isonga_real_estate_db.db
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_PREFIX=isonga
CACHE_TTL=300
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
MAX_FILE_SIZE=10485760
UPLOAD_PATH=$APP_DIR/backend/uploads
EOF

# Create uploads directory
print_status "Creating uploads directory..."
mkdir -p backend/uploads
sudo chown -R www-data:www-data backend/uploads
sudo chmod -R 755 backend/uploads

# Configure Nginx
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/isonga-realty > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Frontend
    location / {
        root $APP_DIR/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Uploads
    location /uploads/ {
        alias $APP_DIR/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/isonga-realty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Configure PM2
print_status "Configuring PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'isonga-backend',
      script: 'backend/server.js',
      cwd: '$APP_DIR',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3200
      },
      error_file: '/var/log/pm2/isonga-backend-error.log',
      out_file: '/var/log/pm2/isonga-backend-out.log',
      log_file: '/var/log/pm2/isonga-backend.log',
      time: true
    }
  ]
};
EOF

# Start application with PM2
print_status "Starting application..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Get SSL certificate
print_status "Getting SSL certificate..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/isonga-realty > /dev/null << EOF
$APP_DIR/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

# Create backup script
print_status "Creating backup script..."
sudo mkdir -p /var/backups/isonga-realty
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/isonga-realty"
tar -czf "\$BACKUP_DIR/backup_\$DATE.tar.gz" -C $APP_DIR .
find \$BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
EOF
chmod +x backup.sh

# Set up cron job for backups
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh") | crontab -

# Final permissions
print_status "Setting final permissions..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR

# Health check
print_status "Performing health check..."
sleep 10

# Check if services are running
if systemctl is-active --quiet redis-server; then
    print_status "✅ Redis is running"
else
    print_error "❌ Redis is not running"
fi

if pm2 list | grep -q "isonga-backend.*online"; then
    print_status "✅ Backend is running"
else
    print_error "❌ Backend is not running"
fi

if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running"
else
    print_error "❌ Nginx is not running"
fi

# Test API endpoint
if curl -f http://localhost:3200/health > /dev/null 2>&1; then
    print_status "✅ API health check passed"
else
    print_warning "⚠️ API health check failed"
fi

echo ""
echo "🎉 Deployment completed!"
echo "========================"
echo "Your application is now running at: https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  pm2 status                    - Check application status"
echo "  pm2 logs isonga-backend       - View backend logs"
echo "  pm2 restart isonga-backend    - Restart backend"
echo "  sudo systemctl status redis   - Check Redis status"
echo "  sudo nginx -t                 - Test Nginx configuration"
echo ""
echo "Backup location: /var/backups/isonga-realty/"
echo "Logs location: /var/log/pm2/"
echo ""
print_status "Deployment completed successfully! 🚀"
