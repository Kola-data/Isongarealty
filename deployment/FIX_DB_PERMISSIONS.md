# Fix Database Permissions - Quick Guide

## Problem
Error: `SQLITE_READONLY: attempt to write a readonly database`

This happens when the SQLite database file or its directory doesn't have write permissions for the `www-data` user (the user running the Node.js backend).

**Affected Operations:**
- Creating properties (POST)
- Updating properties (PUT)
- Deleting properties (DELETE)
- Any database write operations

## Quick Fix (Run on Production Server)

### Option 1: Use the Fix Script (Recommended)

```bash
# SSH into your production server
ssh user@your-server

# Navigate to the deployment directory
cd /path/to/Isongarealty/deployment

# Run the fix script
sudo bash fix-db-permissions.sh /var/www/isongarealty
```

Replace `/var/www/isongarealty` with your actual application directory path.

### Option 2: Manual Fix

```bash
# SSH into your production server
ssh user@your-server

# Set the application directory (adjust path as needed)
APP_DIR="/var/www/isongarealty"
DB_FILE="$APP_DIR/backend/isonga_real_estate_db.db"
DB_DIR="$APP_DIR/backend"

# Set ownership to www-data
sudo chown -R www-data:www-data "$DB_DIR"

# Set directory permissions (755 = rwxr-xr-x)
sudo chmod 755 "$DB_DIR"

# Set database file permissions (664 = rw-rw-r--)
if [ -f "$DB_FILE" ]; then
    sudo chmod 664 "$DB_FILE"
fi

# Verify permissions
ls -lh "$DB_FILE"
```

### Option 3: One-Liner Fix

```bash
sudo chown -R www-data:www-data /var/www/isongarealty/backend && \
sudo chmod 755 /var/www/isongarealty/backend && \
sudo chmod 664 /var/www/isongarealty/backend/isonga_real_estate_db.db
```

## Verify the Fix

After running the fix, verify the permissions:

```bash
# Check ownership
ls -lh /var/www/isongarealty/backend/isonga_real_estate_db.db

# Should show: -rw-rw-r-- 1 www-data www-data ...
```

## Restart the Backend Service

After fixing permissions, restart the backend service:

```bash
sudo systemctl restart isonga-backend
# or
sudo systemctl restart your-backend-service-name
```

## Check Service Status

```bash
sudo systemctl status isonga-backend
```

## Test the Fix

Try the following operations from the dashboard:
- **Create a property** - Should work without errors
- **Update a property** - Should work without errors
- **Delete a property** - Should work without errors

All database write operations should now work correctly.

## Prevention

The deployment script (`deploy.sh`) has been updated to automatically set correct permissions during deployment. Future deployments will include this fix automatically.

## Troubleshooting

If the issue persists:

1. **Check the database file exists:**
   ```bash
   ls -la /var/www/isongarealty/backend/isonga_real_estate_db.db
   ```

2. **Check the directory permissions:**
   ```bash
   ls -ld /var/www/isongarealty/backend
   ```

3. **Check the service user:**
   ```bash
   sudo systemctl show isonga-backend | grep User
   ```
   Should show `User=www-data`

4. **Check SELinux (if enabled):**
   ```bash
   getenforce
   ```
   If it shows "Enforcing", you may need to adjust SELinux contexts.

5. **Check disk space:**
   ```bash
   df -h /var/www/isongarealty/backend
   ```

## Notes

- The database file needs to be writable by the `www-data` user
- The directory containing the database also needs to be writable
- SQLite creates temporary files during writes, so the directory must be writable
- After fixing permissions, always restart the backend service

