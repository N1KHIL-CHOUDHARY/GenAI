# API Services

This directory contains all API-related services and utilities for the application.

## Structure

```
services/
├── api.js          # Main API service with all endpoints
├── README.md       # This documentation
└── types.js        # TypeScript types (if using TypeScript)
```

## API Service (`api.js`)

The main API service provides a centralized way to manage all API calls. It includes:

### Features

- **Centralized Configuration**: Base URL, timeouts, and headers
- **Authentication**: Automatic token management
- **Error Handling**: Consistent error responses
- **Request/Response Interceptors**: For logging and error handling
- **Simulation Mode**: For development without backend

### Service Modules

#### 1. Authentication Service (`authService`)
- `login(email, password)` - User login
- `signup(name, email, password)` - User registration
- `loginWithGoogle()` - Google OAuth login
- `logout()` - User logout
- `verifyToken()` - Token verification
- `refreshToken()` - Token refresh

#### 2. File Service (`fileService`)
- `uploadFile(file)` - Upload file for analysis
- `getAnalysisStatus(fileId)` - Get analysis progress
- `getAnalysisResults(fileId)` - Get analysis results
- `getUserFiles()` - Get user's uploaded files
- `deleteFile(fileId)` - Delete a file

#### 3. Document Service (`documentService`)
- `getSummary(documentId)` - Get document summary
- `chatWithDocument(documentId, message)` - Chat with document

#### 4. User Service (`userService`)
- `getProfile()` - Get user profile
- `updateProfile(profileData)` - Update user profile

### Usage Examples

```javascript
import { authService, fileService } from '../services/api';

// Login
const result = await authService.login('user@example.com', 'password');
if (result.success) {
    console.log('User logged in:', result.data);
}

// Upload file
const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
const uploadResult = await fileService.uploadFile(file);
if (uploadResult.success) {
    console.log('File uploaded:', uploadResult.data);
}
```

### Configuration

The API service can be configured using environment variables:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_API_TIMEOUT=10000
```

### Error Handling

All API calls return a consistent response format:

```javascript
{
    success: boolean,
    data?: any,
    error?: string
}
```

### Development Mode

In development mode, the service simulates API calls with realistic delays and responses. To switch to real API calls:

1. Update the `API_BASE_URL` in `api.js`
2. Replace simulation functions with actual fetch calls
3. Update authentication token handling

### Adding New Endpoints

To add a new API endpoint:

1. Add the function to the appropriate service module
2. Use the `createRequest` helper for consistency
3. Add proper error handling
4. Update this documentation

Example:
```javascript
// In userService
updatePassword: async (currentPassword, newPassword) => {
    return await createRequest('/user/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
    });
}
```

### Testing

The service includes simulation functions that can be used for testing:

```javascript
// Mock successful response
jest.mock('../services/api', () => ({
    authService: {
        login: jest.fn().mockResolvedValue({
            success: true,
            data: { id: 1, email: 'test@example.com' }
        })
    }
}));
```

## Best Practices

1. **Always handle errors**: Check the `success` property before using data
2. **Use TypeScript**: Add proper types for better development experience
3. **Cache responses**: Implement caching for frequently accessed data
4. **Rate limiting**: Add rate limiting for API calls
5. **Retry logic**: Implement retry logic for failed requests
6. **Logging**: Add comprehensive logging for debugging

## Migration to Real API

When ready to connect to a real backend:

1. Update `API_BASE_URL` to your backend URL
2. Replace simulation functions with real API calls
3. Update authentication flow to match your backend
4. Add proper error handling for HTTP status codes
5. Implement proper token refresh logic
6. Add request/response interceptors for logging
