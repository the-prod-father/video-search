# Evidence.com Sync - Quick Checklist

## ✅ What We've Identified

1. **Current Issue**: Getting 401 Unauthorized errors when syncing
2. **Root Cause**: Missing or incorrect Evidence.com API credentials
3. **Solution**: Configure environment variables and verify API access

## 🔧 Immediate Steps to Fix

### Step 1: Create `.env.local` file
Create a file named `.env.local` in the project root with:

```bash
EVIDENCE_CLIENT_ID=your_client_id_here
EVIDENCE_API_SECRET=your_client_secret_here
EVIDENCE_PARTNER_ID=your_partner_id_here
```

### Step 2: Get Your Credentials
1. Log into Evidence.com
2. Go to **Admin > Security Settings > API Settings**
3. Create or view your API client
4. Ensure it has `any.read` permission for Evidence
5. Copy Client ID, Client Secret, and Partner ID

### Step 3: Restart Dev Server
After adding `.env.local`, restart your Next.js dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test the Sync
1. Click "Sync Evidence.com" button in the browser
2. Check the browser console (F12) for errors
3. Check terminal logs for detailed debugging info

## 🔍 Debugging

The improved API route now:
- ✅ Tries multiple authentication endpoints and scopes
- ✅ Tries multiple video API endpoints
- ✅ Provides detailed console logging
- ✅ Shows which environment variables are missing
- ✅ Falls back to demo mode if auth fails

**Check these locations for errors:**
1. **Browser Console** (F12 → Console tab) - Shows frontend errors
2. **Terminal/Server Logs** - Shows detailed API debugging with `[Evidence.com]` prefix
3. **Network Tab** (F12 → Network) - Shows API request/response details

## 📋 What the Code Now Does

### Authentication
Tries 8 different combinations:
- `https://api.evidence.com/oauth2/token` with `read` and `any.read` scopes
- `https://evidence.com/api/oauth2/token` with `read` and `any.read` scopes  
- `https://[PARTNER_ID].evidence.com/api/oauth2/token` with `read` and `any.read` scopes
- `https://[PARTNER_ID]/api/oauth2/token` with `read` and `any.read` scopes

### Video Fetching
Tries 18 different endpoint combinations:
- Base URLs: `api.evidence.com`, `[PARTNER_ID].evidence.com`, `[PARTNER_ID]`
- Endpoints: `/api/v2/media`, `/api/v2/files`, `/api/v1/media`, `/api/v1/files`, `/api/v2/evidence`, `/api/v2/media/files`

### Error Messages
Now provides:
- Which environment variables are missing
- Which endpoints were tried
- Last error details
- Configuration status (without exposing secrets)

## 🎯 Expected Behavior

**Success:**
- Videos appear in "Evidence.com Videos" section
- Success message shows count of videos found
- No error messages

**Failure (with credentials):**
- Error message shows what's wrong
- Server logs show detailed debugging
- Falls back to demo mode automatically

**Failure (no credentials):**
- Clear error about missing environment variables
- Instructions on what to configure

## 📚 Additional Resources

See `EVIDENCE_SYNC_REQUIREMENTS.md` for detailed documentation.

