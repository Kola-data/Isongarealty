# API Configuration Guide

## 🌐 Online API Setup

Your application is now configured to fetch data from an online API. Here's how it works:

### **Automatic Environment Detection**

The application automatically detects whether it's running in development or production mode:

- **Development Mode**: Uses `http://localhost:5000` (local backend)
- **Production Mode**: Uses `https://api.isongarealty.com` (online API)

### **Configuration Files**

#### **API Configuration** (`frontend/src/config/api.ts`)
```typescript
const getApiBaseUrl = () => {
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL || 'https://api.isongarealty.com';
};
```

#### **API Client** (`frontend/src/utils/apiClient.ts`)
- ✅ Automatic retry logic for network errors
- ✅ Request/response logging
- ✅ Error handling and user-friendly messages
- ✅ Timeout configuration (10 seconds)

### **Environment Variables**

You can override the API URL using environment variables:

#### **For Development**
```bash
# Create .env file in frontend directory
VITE_API_URL=http://localhost:5000
```

#### **For Production**
```bash
# Create .env.production file in frontend directory
VITE_API_URL=https://api.isongarealty.com
```

### **API Endpoints**

The following endpoints are configured:

- **Properties**: `GET /api/properties`
- **Property Images**: `GET /api/properties/{id}/images`
- **Health Check**: `GET /health`
- **Cache Stats**: `GET /api/cache/stats`

### **Error Handling**

The application includes comprehensive error handling:

1. **Network Errors**: Automatic retry with 1-second delay
2. **Server Errors**: User-friendly error messages
3. **Timeout**: 10-second timeout for all requests
4. **Fallback**: Graceful degradation when API is unavailable

### **Testing API Connection**

The application automatically tests the API connection on startup. Check the browser console for:

```
🔍 Testing API connection...
📡 Testing health endpoint...
✅ Health check passed: {status: "OK"}
📡 Testing properties endpoint...
✅ Properties endpoint passed: X properties found
🎉 All API tests passed!
```

### **Production Deployment**

#### **1. Build for Production**
```bash
cd frontend
npm run build
```

#### **2. Deploy to VPS**
Use the provided deployment script:
```bash
./deployment/deploy.sh
```

#### **3. Configure Environment**
Set the production API URL:
```bash
export VITE_API_URL=https://api.isongarealty.com
```

### **Troubleshooting**

#### **API Connection Issues**

1. **Check Network**: Ensure internet connection
2. **Check API URL**: Verify the API endpoint is correct
3. **Check CORS**: Ensure the API allows cross-origin requests
4. **Check SSL**: Ensure HTTPS certificates are valid

#### **Common Error Messages**

- `"Failed to fetch properties. Please check your internet connection."`
  - **Solution**: Check network connection and API availability

- `"Network Error"`
  - **Solution**: Check if the API server is running

- `"Timeout Error"`
  - **Solution**: Check API server performance or increase timeout

### **Monitoring**

#### **Browser Console**
- All API requests are logged
- Error details are provided
- Connection status is displayed

#### **Network Tab**
- Monitor request/response times
- Check HTTP status codes
- Verify data payloads

### **Performance Optimization**

#### **Caching**
- Properties are cached in memory
- Images are cached by the browser
- API responses include cache headers

#### **Retry Logic**
- Automatic retry for network failures
- Exponential backoff for repeated failures
- Graceful degradation for persistent issues

### **Security**

#### **HTTPS Only**
- Production API uses HTTPS
- All requests are encrypted
- SSL certificates are validated

#### **CORS Configuration**
- API server configured for cross-origin requests
- Specific domains allowed for security

### **Development vs Production**

| Feature | Development | Production |
|---------|-------------|------------|
| API URL | `localhost:5000` | `api.isongarealty.com` |
| Protocol | HTTP | HTTPS |
| Caching | Basic | Redis + Browser |
| Error Handling | Verbose | User-friendly |
| Logging | Detailed | Essential only |

Your application is now ready to fetch data from the online API! 🚀
