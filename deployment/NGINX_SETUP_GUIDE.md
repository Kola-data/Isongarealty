# 🚀 Complete Nginx Setup Guide for Isonga Realty Application

## 📋 Overview

This guide provides a complete setup for Nginx to serve both your React frontend and Node.js backend, with Redis caching support.

## 🏗️ Architecture

```
Internet → Nginx (Port 80/443) → Frontend (React) + Backend API (Node.js) + Redis Cache
```

## 🛠️ Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
cd deployment
./complete-setup.sh
```

### Option 2: Manual Setup
```bash
cd deployment
./nginx-setup.sh
```

## 📁 File Structure

```
deployment/
├── nginx.conf              # Main Nginx configuration
├── redis.conf              # Redis configuration
├── backend.service         # Systemd service for backend
├── redis.service          # Systemd service for Redis
├── nginx-setup.sh         # Nginx setup script
├── complete-setup.sh      # Complete automated setup
├── deploy.sh              # Deployment script (auto-generated)
├── setup-ssl.sh           # SSL setup script (auto-generated)
├── monitor.sh             # Monitoring script (auto-generated)
└── backup.sh              # Backup script (auto-generated)
```

## 🔧 Configuration Details

### 1. Nginx Configuration (`nginx.conf`)

**Features:**
- ✅ SSL/HTTPS support with Let's Encrypt
- ✅ Frontend serving (React build)
- ✅ Backend API proxying
- ✅ Rate limiting for API endpoints
- ✅ File upload support (50MB max)
- ✅ Static asset caching
- ✅ Security headers
- ✅ Gzip compression

**Key Routes:**
- `/` → Frontend React app
- `/api/` → Backend API
- `/uploads/` → Static file serving
- `/health` → Health check endpoint

### 2. Redis Configuration (`redis.conf`)

**Features:**
- ✅ Production-ready settings
- ✅ Memory management (256MB max)
- ✅ Persistence (RDB + AOF)
- ✅ Security (password protection)
- ✅ Performance optimization

### 3. Systemd Services

**Backend Service (`isongarealty-backend.service`):**
- ✅ Auto-restart on failure
- ✅ Security hardening
- ✅ Resource limits
- ✅ Redis dependency

**Redis Service (`redis.service`):**
- ✅ Secure configuration
- ✅ Resource limits
- ✅ Proper user permissions

## 🚀 Deployment Process

### Step 1: Run Setup Script
```bash
cd deployment
./complete-setup.sh
```

### Step 2: Deploy Application
```bash
# Copy your application files
cp -r ../frontend /var/www/isongarealty/
cp -r ../backend /var/www/isongarealty/

# Deploy
./deploy.sh
```

### Step 3: Setup SSL (Optional)
```bash
# Update domain name in setup-ssl.sh first
./setup-ssl.sh
```

## 🔍 Monitoring & Management

### Service Status
```bash
# Check all services
./monitor.sh

# Individual service status
sudo systemctl status nginx
sudo systemctl status redis-server
sudo systemctl status isongarealty-backend
```

### Service Management
```bash
# Restart services
sudo systemctl restart nginx
sudo systemctl restart redis-server
sudo systemctl restart isongarealty-backend

# Enable/disable services
sudo systemctl enable nginx
sudo systemctl enable redis-server
sudo systemctl enable isongarealty-backend
```

### Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Backend logs
sudo journalctl -u isongarealty-backend -f
```

## 🔒 Security Features

### Nginx Security
- ✅ SSL/TLS encryption
- ✅ Security headers (HSTS, XSS protection, etc.)
- ✅ Rate limiting
- ✅ File upload restrictions
- ✅ Hidden file protection

### Redis Security
- ✅ Password authentication
- ✅ Command renaming
- ✅ Memory limits
- ✅ Network binding

### System Security
- ✅ Firewall configuration (UFW)
- ✅ Non-root user execution
- ✅ Resource limits
- ✅ Private directories

## 📊 Performance Optimization

### Nginx Optimizations
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Connection pooling
- ✅ Buffer optimization

### Redis Optimizations
- ✅ Memory-efficient data structures
- ✅ Persistence optimization
- ✅ Connection pooling
- ✅ Lazy freeing

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Manual backup
./backup.sh

# Backup includes:
# - Application files
# - Redis data
# - Nginx configuration
# - Auto-cleanup (7 days retention)
```

### Recovery Process
```bash
# Restore from backup
sudo tar -xzf /var/backups/isongarealty/app_YYYYMMDD_HHMMSS.tar.gz -C /
sudo systemctl restart nginx redis-server isongarealty-backend
```

## 🌐 URLs & Endpoints

### Production URLs
- **Frontend:** `https://isongarealty.com`
- **Backend API:** `https://isongarealty.com/api`
- **Health Check:** `https://isongarealty.com/health`
- **Cache Stats:** `https://isongarealty.com/api/cache/stats`

### Development URLs
- **Frontend:** `http://localhost:8080`
- **Backend:** `http://localhost:5000`
- **Redis:** `localhost:6379`

## 🛠️ Troubleshooting

### Common Issues

**1. Nginx not starting:**
```bash
sudo nginx -t  # Test configuration
sudo systemctl status nginx
```

**2. Redis connection issues:**
```bash
redis-cli ping
sudo systemctl status redis-server
```

**3. Backend not starting:**
```bash
sudo journalctl -u isongarealty-backend -f
sudo systemctl status isongarealty-backend
```

**4. Permission issues:**
```bash
sudo chown -R www-data:www-data /var/www/isongarealty
sudo chmod -R 755 /var/www/isongarealty
```

### Performance Monitoring
```bash
# System resources
htop
df -h
free -h

# Redis memory usage
redis-cli info memory

# Nginx connections
sudo netstat -tulpn | grep nginx
```

## 📝 Configuration Files

### Environment Variables
```bash
# Backend service environment
NODE_ENV=production
PORT=5000
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_secure_password
```

### Firewall Rules
```bash
# UFW configuration
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 🎯 Production Checklist

- [ ] SSL certificates configured
- [ ] Domain name updated in configuration
- [ ] Redis password changed
- [ ] Firewall configured
- [ ] Backup system working
- [ ] Monitoring scripts tested
- [ ] All services running
- [ ] Health checks passing

## 🆘 Support

If you encounter issues:

1. **Check service status:** `./monitor.sh`
2. **Check logs:** `sudo journalctl -u service-name -f`
3. **Test configuration:** `sudo nginx -t`
4. **Restart services:** `sudo systemctl restart service-name`

## 🎉 Success!

Your Isonga Realty application is now running with:
- ✅ **Nginx** serving frontend and backend
- ✅ **Redis** providing caching
- ✅ **SSL** encryption
- ✅ **Security** hardening
- ✅ **Monitoring** and backup systems
- ✅ **Production-ready** configuration

Your application is ready for production deployment! 🚀
