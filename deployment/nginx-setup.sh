#!/bin/bash

# Nginx Setup Script for Isonga Realty Application
# This script sets up Nginx to serve both frontend and backend with Redis support

set -e

echo "🚀 Setting up Nginx for Isonga Realty Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Nginx
print_status "Installing Nginx..."
sudo apt install nginx -y

# Install Redis
print_status "Installing Redis..."
sudo apt install redis-server -y

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/isongarealty
sudo chown -R $USER:$USER /var/www/isongarealty

# Create backend directory
sudo mkdir -p /var/www/isongarealty/backend
sudo mkdir -p /var/www/isongarealty/backend/uploads
sudo chown -R $USER:$USER /var/www/isongarealty/backend

# Create frontend directory
sudo mkdir -p /var/www/isongarealty/frontend
sudo chown -R $USER:$USER /var/www/isongarealty/frontend

# Copy Nginx configuration
print_status "Setting up Nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/isongarealty
sudo ln -sf /etc/nginx/sites-available/isongarealty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# Configure Redis
print_status "Configuring Redis..."
sudo cp redis.conf /etc/redis/redis.conf

# Set Redis password (change this in production!)
REDIS_PASSWORD=$(openssl rand -base64 32)
sudo sed -i "s/your_redis_password_here/$REDIS_PASSWORD/g" /etc/redis/redis.conf

# Create Redis log directory
sudo mkdir -p /var/log/redis
sudo chown redis:redis /var/log/redis

# Start and enable services
print_status "Starting and enabling services..."
sudo systemctl enable nginx
sudo systemctl enable redis-server
sudo systemctl restart nginx
sudo systemctl restart redis-server

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable

# Create systemd service for backend
print_status "Creating systemd service for backend..."
sudo tee /etc/systemd/system/isongarealty-backend.service > /dev/null <<EOF
[Unit]
Description=Isonga Realty Backend API
After=network.target redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/isongarealty/backend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=REDIS_URL=redis://localhost:6379
Environment=REDIS_PASSWORD=$REDIS_PASSWORD

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable backend service
sudo systemctl daemon-reload
sudo systemctl enable isongarealty-backend.service

# Create deployment script
print_status "Creating deployment script..."
cat > deploy.sh << 'EOF'
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
sudo chown -R $USER:$USER /var/www/isongarealty/backend

# Install backend dependencies
echo "Installing backend dependencies..."
cd /var/www/isongarealty/backend
npm install --production

# Restart services
echo "Restarting services..."
sudo systemctl restart isongarealty-backend
sudo systemctl restart nginx
sudo systemctl restart redis-server

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend: https://isongarealty.com"
echo "🔧 Backend API: https://isongarealty.com/api"
echo "📊 Redis: localhost:6379"
EOF

chmod +x deploy.sh

# Create SSL setup script
print_status "Creating SSL setup script..."
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
print_status "Creating monitoring script..."
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

print_success "Nginx setup completed successfully!"
print_status "Next steps:"
echo "1. Copy your application files to /var/www/isongarealty/"
echo "2. Run ./deploy.sh to deploy your application"
echo "3. Run ./setup-ssl.sh to configure SSL certificates"
echo "4. Run ./monitor.sh to check service status"

print_warning "Important: Update the Redis password in /etc/redis/redis.conf"
print_warning "Important: Update your domain name in setup-ssl.sh"

echo ""
echo "🔧 Service Management Commands:"
echo "sudo systemctl status nginx"
echo "sudo systemctl status redis-server"
echo "sudo systemctl status isongarealty-backend"
echo "sudo systemctl restart nginx"
echo "sudo systemctl restart redis-server"
echo "sudo systemctl restart isongarealty-backend"
