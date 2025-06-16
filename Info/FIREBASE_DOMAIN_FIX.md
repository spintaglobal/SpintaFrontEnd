# Firebase Unauthorized Domain Fix

## Problem
Getting error: `Firebase: Error (auth/unauthorized-domain)` when trying to use Google Sign-In in production.

## Solution
You need to add your production domain to Firebase's authorized domains list.

### Steps to Fix:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: `spinta-84f45`

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "Settings" tab
   - Click on "Authorized domains"

3. **Add Your Production Domains**
   Add these domains to the authorized list:
   - `spinta.org`
   - `www.spinta.org`
   - Your Netlify domain (if using Netlify hosting)
   - Any other domains where your app is deployed

4. **Common Domains to Add**
   ```
   localhost (already there by default)
   spinta.org
   www.spinta.org
   your-app-name.netlify.app (if using Netlify)
   your-custom-domain.com
   ```

5. **Test Again**
   After adding the domains, try Google Sign-In again in production.

### Debug Information
The updated code now logs the current domain to help you identify what domain needs to be added:
- Check browser console for domain information
- Look for messages like "Current domain: your-domain.com"

### Notes
- Changes take effect immediately
- No need to redeploy your app
- Make sure to add both www and non-www versions of your domain
- Firebase may require HTTPS for production domains 