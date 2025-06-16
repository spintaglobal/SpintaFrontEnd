# 🔧 Maintenance Mode Toggle Guide

## Overview
This feature allows you to instantly turn your entire production site on or off using a simple environment variable. Perfect for planned maintenance, deployments, or emergency situations.

## How It Works
The site checks the `VITE_SITE_ENABLED` environment variable:
- **`VITE_SITE_ENABLED=true`** (or not set): Normal site operation
- **`VITE_SITE_ENABLED=false`**: Shows maintenance page

## Setup Instructions

### 1. Netlify Environment Variables
1. Go to your Netlify dashboard
2. Navigate to **Site Settings** → **Environment Variables**
3. Add the variable:
   - **Key**: `VITE_SITE_ENABLED`
   - **Value**: `true` (for normal operation)

### 2. Turning OFF the Site (Maintenance Mode)
1. In Netlify, change the environment variable:
   - **Key**: `VITE_SITE_ENABLED`
   - **Value**: `false`
2. **Trigger a new deployment** (important!)
   - Option A: Push any commit to your repository
   - Option B: Go to **Deploys** → **Trigger Deploy** → **Deploy Site**
3. ✅ Site will show maintenance page

### 3. Turning ON the Site (Normal Operation)
1. In Netlify, change the environment variable:
   - **Key**: `VITE_SITE_ENABLED`
   - **Value**: `true`
2. **Trigger a new deployment**
3. ✅ Site will operate normally

## Quick Toggle Steps

### 🔴 Enable Maintenance Mode
```
1. Netlify → Site Settings → Environment Variables
2. VITE_SITE_ENABLED = false
3. Trigger Deploy
4. ✅ Maintenance page is live
```

### 🟢 Disable Maintenance Mode
```
1. Netlify → Site Settings → Environment Variables
2. VITE_SITE_ENABLED = true
3. Trigger Deploy
4. ✅ Normal site is live
```

## Features of the Maintenance Page
- 🎨 **Beautiful Design**: Matches your app's design theme
- 📱 **Responsive**: Works on all devices
- ✨ **Animated**: Engaging user experience
- 🔄 **Refresh Button**: Users can check if site is back online
- 📧 **Contact Support**: Direct email link
- ⏱️ **Loading Animations**: Professional look and feel

## Important Notes
- ⚠️ **Always trigger a new deployment** after changing the environment variable
- 🚀 **Changes are instant** once deployment completes
- 🔒 **No code changes needed** - pure configuration
- 👥 **All users see maintenance page** when enabled
- 💾 **User data is safe** - just frontend display changes

## Testing Locally
To test maintenance mode locally:
1. Create a `.env` file in AppFrontend folder
2. Add: `VITE_SITE_ENABLED=false`
3. Run: `npm run dev`
4. 🔧 You'll see the maintenance page

## Emergency Use
Perfect for:
- 🚨 **Emergency shutdowns**
- 🔧 **Planned maintenance**
- 🚀 **Major deployments**
- 🐛 **Critical bug fixes**
- 📊 **Database migrations**

----

**Pro Tip**: Bookmark your Netlify environment variables page for quick access during emergencies! 