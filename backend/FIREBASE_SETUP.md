# Firebase Setup Guide

## Required Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=AI DocAnalyzer <no-reply@example.com>

# File Upload Configuration
ALLOWED_FILE_TYPES=application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain
MAX_FILE_SIZE=10485760

# Frontend URLs
FRONTEND_URLS=http://localhost:8080,http://localhost:5173
FRONTEND_GOOGLE_REDIRECT=http://localhost:8080/dashboard

# Server Configuration
PORT=5000
NODE_ENV=development
```

## Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file and extract the required values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Firestore Database Setup

1. In Firebase Console, go to Firestore Database
2. Create a new database in production mode
3. The following collections will be automatically created:
   - `users` - User accounts and authentication data
   - `documents` - Document metadata and analysis results

## Security Rules

Set up Firestore security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Documents can only be accessed by owner or shared users
    match /documents/{documentId} {
      allow read, write: if request.auth != null && 
        (resource.data.user == request.auth.uid || 
         request.auth.uid in resource.data.sharedWith[*].user);
    }
  }
}
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables

3. Create uploads directory:
   ```bash
   mkdir uploads
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

## Migration Notes

- All Mongoose models have been replaced with Firestore collections
- User authentication now uses Firestore for user management
- Document operations use Firestore for storage and retrieval
- The data structure remains compatible with the existing frontend
- Frontend is configured for port 8080
- Google OAuth redirects to dashboard page
- File uploads are configured with proper validation
