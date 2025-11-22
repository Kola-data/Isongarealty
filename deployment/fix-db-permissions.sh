#!/bin/bash

# Fix Database Permissions Script
# This script fixes SQLite database file permissions for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Get the application directory (default or from argument)
APP_DIR="${1:-/var/www/isongarealty}"

if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    exit 1
fi

print_status "Fixing database permissions for: $APP_DIR"

# Database file path
DB_FILE="$APP_DIR/backend/isonga_real_estate_db.db"
DB_DIR="$APP_DIR/backend"

# Check if database file exists
if [ ! -f "$DB_FILE" ]; then
    print_warning "Database file not found at $DB_FILE"
    print_status "Creating database directory if it doesn't exist..."
    mkdir -p "$DB_DIR"
fi

# Set ownership to www-data (the user running the Node.js app)
print_status "Setting ownership to www-data:www-data..."
sudo chown -R www-data:www-data "$DB_DIR"

# Set proper permissions
# Directory: 755 (rwxr-xr-x) - owner can read/write/execute, others can read/execute
# Database file: 664 (rw-rw-r--) - owner and group can read/write, others can read
print_status "Setting directory permissions to 755..."
sudo chmod 755 "$DB_DIR"

if [ -f "$DB_FILE" ]; then
    print_status "Setting database file permissions to 664..."
    sudo chmod 664 "$DB_FILE"
    
    # Also ensure the parent directory of the database file is writable
    print_status "Ensuring database directory is writable..."
    sudo chmod u+w "$DB_DIR"
else
    print_warning "Database file doesn't exist yet. It will be created with correct permissions on first write."
fi

# Verify permissions
print_status "Verifying permissions..."
if [ -f "$DB_FILE" ]; then
    ls -lh "$DB_FILE"
    print_status "Database file permissions verified!"
else
    print_warning "Database file will be created on first database operation."
fi

print_status "Database permissions fixed successfully!"
print_status "The database should now be writable by the www-data user."

