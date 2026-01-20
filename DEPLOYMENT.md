# Deployment Guide

## Netlify Deployment

This application is configured for deployment on Netlify.

### Prerequisites

1. Your Directus backend must be accessible from the internet (not just localhost or private network)
2. CORS must be properly configured on your Directus instance to allow requests from your Netlify domain

### Steps

1. **Connect your repository to Netlify**
   - Log in to Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository

2. **Configure build settings**
   - Build command: `npm run build` (already configured in netlify.toml)
   - Publish directory: `dist` (already configured in netlify.toml)

3. **Set environment variables**
   Go to Site settings → Environment variables and add:

   ```
   VITE_GRAPHQL_URL=https://your-directus-domain.com/graphql
   VITE_ASSETS_URL=https://your-directus-domain.com/assets
   ```

   Replace `https://your-directus-domain.com` with your actual Directus backend URL.

4. **Configure Directus CORS**
   In your Directus instance, configure CORS to allow your Netlify domain:

   - Go to Directus Settings → Project Settings
   - Add your Netlify URL (e.g., `https://your-app.netlify.app`) to allowed origins
   - Or use `*` for development (not recommended for production)

5. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your application

### Local Development

For local development, the proxy is automatically used (configured in vite.config.ts), so you don't need to set environment variables.

### Important Notes

- The current configuration uses `http://10.43.0.43:8055` which is a private IP address
- This will NOT work in production on Netlify
- You MUST replace this with a publicly accessible URL in the Netlify environment variables
- Consider using a service like ngrok, expose your server publicly, or deploy Directus to a cloud service
