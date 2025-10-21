#!/bin/bash

# Build script for production with online API
echo "🚀 Building for production with online API..."

# Set environment variable for online API
export VITE_API_URL=https://api.isongarealty.com

# Build the application
npm run build

echo "✅ Production build complete!"
echo "📦 Built files are in the 'dist' directory"
echo "🌐 API endpoint: https://api.isongarealty.com"
