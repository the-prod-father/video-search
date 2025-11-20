# Vercel Environment Variables Checklist

## Required Environment Variables

### 1. TWELVELABS_API_KEY (REQUIRED)
- **Purpose**: Authenticate with TwelveLabs API for video search and analysis
- **Where to get it**: TwelveLabs dashboard → API Keys
- **Status**: ⚠️ **CRITICAL** - Application will fail without this
- **Vercel Setting**: Settings → Environment Variables → Add `TWELVELABS_API_KEY`

### 2. EVIDENCE_CLIENT_ID (Optional)
- **Purpose**: Evidence.com API authentication for syncing videos
- **Where to get it**: Evidence.com Admin → Security Settings → API Settings
- **Status**: Optional**: App works without it, but Evidence.com sync will fail
- **Vercel Setting**: Settings → Environment Variables → Add `EVIDENCE_CLIENT_ID`

### 3. EVIDENCE_API_SECRET (Optional)
- **Purpose**: Evidence.com API secret key
- **Where to get it**: Evidence.com Admin → Security Settings → API Settings
- **Note**: Copy immediately when creating - Evidence.com never shows it again
- **Vercel Setting**: Settings → Environment Variables → Add `EVIDENCE_API_SECRET`

### 4. EVIDENCE_PARTNER_ID (Optional)
- **Purpose**: Evidence.com partner/agency identifier
- **Where to get it**: Evidence.com Admin → Security Settings → API Settings
- **Format**: Usually looks like `3F68B73F-23C0-43EA-9034-2194F9F7B35B`
- **Vercel Setting**: Settings → Environment Variables → Add `EVIDENCE_PARTNER_ID`

## How to Add to Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project: `video-search-roan`
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: `TWELVELABS_API_KEY`
   - **Value**: Your API key
   - **Environment**: Select all (Production, Preview, Development)
   - Click **Save**
5. Repeat for each variable above

## Verification

After adding variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment (or wait for auto-deploy)
3. Check deployment logs to ensure build succeeds
4. Visit `https://video-search-roan.vercel.app` to verify

## Current Status

✅ **Git**: All changes pushed to `main` branch
✅ **Build**: Local build successful
✅ **Error Components**: Added `error.tsx` and `not-found.tsx`
✅ **SSR Issues**: Fixed search page with Suspense wrapper
✅ **Metadata**: Open Graph and Twitter Cards configured

## Next Steps

1. ✅ Verify all code is pushed (done)
2. ⏳ Add environment variables to Vercel (see above)
3. ⏳ Verify Vercel deployment succeeds
4. ⏳ Test production site at https://video-search-roan.vercel.app

