# Redis-Only Setup for VPS

## 🚀 Quick Redis Installation

### 1. Install Redis
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Redis
sudo apt install redis-server -y

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### 2. Configure Redis for Production
```bash
# Backup original config
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Edit Redis configuration
sudo nano /etc/redis/redis.conf
```

**Replace the entire content with:**
```conf
# Redis Production Configuration
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 300

# Security
protected-mode yes
requirepass your_strong_redis_password_here
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""

# Memory Management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /var/lib/redis

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
syslog-enabled no

# Client Management
maxclients 10000

# Slow Log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency Monitoring
latency-monitor-threshold 100
```

### 3. Secure Redis
```bash
# Set strong password (replace with your password)
sudo sed -i 's/your_strong_redis_password_here/YourStrongPassword123!/g' /etc/redis/redis.conf

# Restart Redis
sudo systemctl restart redis-server

# Test connection
redis-cli -a YourStrongPassword123! ping
```

### 4. Configure Firewall
```bash
# Install UFW if not installed
sudo apt install ufw -y

# Configure firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

### 5. Monitor Redis
```bash
# Check Redis status
sudo systemctl status redis-server

# Monitor Redis in real-time
redis-cli -a YourStrongPassword123! monitor

# Check memory usage
redis-cli -a YourStrongPassword123! info memory

# Check connected clients
redis-cli -a YourStrongPassword123! client list
```

## 🔧 Environment Variables for Your App

Update your backend `.env` file:
```env
# Redis Configuration
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=YourStrongPassword123!
REDIS_PREFIX=isonga
CACHE_TTL=300
CACHE_MAX_RETRIES=3
CACHE_RETRY_DELAY=1000
```

## 🛡️ Security Checklist

- [ ] Redis password set
- [ ] Dangerous commands disabled
- [ ] Memory limits configured
- [ ] Firewall configured
- [ ] Redis bound to localhost only
- [ ] Logging enabled
- [ ] Persistence configured

## 📊 Monitoring Commands

```bash
# Check Redis performance
redis-cli -a YourStrongPassword123! --latency-history

# Monitor Redis operations
redis-cli -a YourStrongPassword123! monitor

# Check Redis info
redis-cli -a YourStrongPassword123! info

# Check slow queries
redis-cli -a YourStrongPassword123! slowlog get 10

# Check memory usage
redis-cli -a YourStrongPassword123! info memory
```

## 🚨 Troubleshooting

### Redis won't start:
```bash
# Check Redis logs
sudo tail -f /var/log/redis/redis-server.log

# Check configuration
sudo redis-server /etc/redis/redis.conf --test-memory 1
```

### Connection refused:
```bash
# Check if Redis is running
sudo systemctl status redis-server

# Check if port is open
sudo netstat -tlnp | grep 6379
```

### Memory issues:
```bash
# Check memory usage
redis-cli -a YourStrongPassword123! info memory

# Clear cache if needed
redis-cli -a YourStrongPassword123! flushall
```

## 📈 Performance Optimization

### 1. Memory Optimization
```bash
# Set appropriate memory limit
redis-cli -a YourStrongPassword123! config set maxmemory 256mb
redis-cli -a YourStrongPassword123! config set maxmemory-policy allkeys-lru
```

### 2. Persistence Optimization
```bash
# Adjust save intervals
redis-cli -a YourStrongPassword123! config set save "900 1 300 10 60 10000"
```

### 3. Network Optimization
```bash
# Set TCP keepalive
redis-cli -a YourStrongPassword123! config set tcp-keepalive 300
```

## 🔄 Backup & Recovery

### Backup Redis Data
```bash
# Create backup
sudo cp /var/lib/redis/dump.rdb /var/backups/redis-backup-$(date +%Y%m%d).rdb

# Restore from backup
sudo systemctl stop redis-server
sudo cp /var/backups/redis-backup-YYYYMMDD.rdb /var/lib/redis/dump.rdb
sudo systemctl start redis-server
```

### Automated Backup Script
```bash
# Create backup script
sudo nano /usr/local/bin/redis-backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/redis"
mkdir -p $BACKUP_DIR
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis-backup-$DATE.rdb
find $BACKUP_DIR -name "redis-backup-*.rdb" -mtime +7 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/redis-backup.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/redis-backup.sh") | crontab -
```

## ✅ Verification

Test your Redis setup:
```bash
# Test connection
redis-cli -a YourStrongPassword123! ping
# Should return: PONG

# Test set/get
redis-cli -a YourStrongPassword123! set test "Hello Redis"
redis-cli -a YourStrongPassword123! get test
# Should return: "Hello Redis"

# Test cache functionality
redis-cli -a YourStrongPassword123! set "isonga:test" "Cache working"
redis-cli -a YourStrongPassword123! get "isonga:test"
# Should return: "Cache working"
```

Your Redis is now ready for production use! 🚀
