# Google OAuth Troubleshooting Guide

## 🚨 Current Error: "Wrong recipient, payload audience != requiredAudience"

This error occurs when the Google OAuth client ID doesn't match between your frontend and backend.

## 🔍 Debug Information Added

The backend now includes detailed logging to help diagnose the issue:

### Google Login Debug Output:
```
🔍 Google Login Debug:
Expected Client ID: [your-client-id]
Received idToken length: [token-length]
✅ Token verified successfully
Token audience: [audience-from-token]
Token issuer: [issuer-from-token]
User email: [user-email]
```

### Google Callback Debug Output:
```
🔍 Google Callback Debug:
Received authorization code: Yes/No
Client ID: [your-client-id]
Client Secret length: [secret-length]
✅ Tokens received successfully
Access token length: [access-token-length]
ID token length: [id-token-length]
```

## 🛠️ Common Solutions

### 1. **Check Environment Variables**
Verify your `.env` file has the correct values:

```bash
# These MUST match your Google Cloud Console exactly
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-console
```

### 2. **Verify Google Cloud Console Configuration**

#### Step 1: Check OAuth 2.0 Client IDs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Look for **OAuth 2.0 Client IDs**

#### Step 2: Verify Authorized Origins
Make sure your OAuth client has:
- **Authorized JavaScript origins**: `http://localhost:8080`
- **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`

### 3. **Check Frontend Configuration**
Ensure your frontend is using the **same** `GOOGLE_CLIENT_ID` as your backend.

### 4. **Verify Project ID**
Make sure you're using the correct Google Cloud project.

## 🔧 Step-by-Step Fix

### Step 1: Get Correct Credentials
1. Go to Google Cloud Console
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Copy the **Client ID** and **Client Secret**

### Step 2: Update Environment Variables
```bash
# In your .env file
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

### Step 3: Restart Server
```bash
# Stop the server (Ctrl+C) and restart
npm start
```

### Step 4: Test Google Login
Try logging in with Google again and check the console output.

## 🚫 Common Mistakes

1. **Using different client IDs** for frontend and backend
2. **Copying credentials from wrong project**
3. **Missing or incorrect redirect URIs**
4. **Using test credentials in production**

## 📋 Verification Checklist

- [ ] Frontend and backend use the same `GOOGLE_CLIENT_ID`
- [ ] Environment variables are correctly set
- [ ] Google Cloud Console has correct authorized origins
- [ ] Google Cloud Console has correct redirect URIs
- [ ] Server has been restarted after environment changes
- [ ] Console shows successful token verification

## 🆘 Still Having Issues?

If the problem persists after following these steps:

1. **Check the console output** for the debug information
2. **Verify the token audience** matches your client ID
3. **Ensure you're using the correct Google account**
4. **Check if you have multiple OAuth clients** configured

## 📞 Additional Help

- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Google Cloud Console: https://console.cloud.google.com/
- Firebase Console: https://console.firebase.google.com/
