# Deployment Guide

## Netlify Deployment

This application uses **Netlify Functions** to proxy requests to your Directus backend, solving CORS and mixed content (HTTP/HTTPS) issues.

### How It Works

- **Development**: Uses Vite proxy (configured in `vite.config.ts`)
- **Production**: Uses Netlify Functions to proxy GraphQL and asset requests
- **Benefit**: Your Directus backend can remain on HTTP or a private network

### Prerequisites

Your Directus backend needs to be accessible from Netlify's servers. This can be:
- A public URL (HTTPS or HTTP)
- A private network IP that Netlify can reach
- Even `http://10.43.0.43:8055` will work if accessible from Netlify's infrastructure

### Steps

1. **Connect your repository to Netlify**
   - Log in to Netlify
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository

2. **Configure build settings**
   - Build command: `npm run build` (already configured in netlify.toml)
   - Publish directory: `dist` (already configured in netlify.toml)
   - These are set automatically via `netlify.toml`

3. **Set environment variables**
   Go to Site settings → Environment variables and add:

   ```
   DIRECTUS_GRAPHQL_URL=http://10.43.0.43:8055/graphql
   DIRECTUS_ASSETS_URL=http://10.43.0.43:8055/assets
   ```

   Replace with your actual Directus backend URL (can be HTTP or HTTPS).

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically:
     - Build your application
     - Deploy the static files
     - Create serverless functions for GraphQL and assets proxy

### Architecture

```
Browser (HTTPS)
    ↓
Netlify Site (HTTPS)
    ↓
Netlify Functions (Serverless)
    ↓
Directus Backend (HTTP or HTTPS)
```

### Local Development

For local development, the Vite proxy is automatically used (configured in `vite.config.ts`), so you don't need to set environment variables.

Just run: `npm run dev`

### Serverless Functions

Two Netlify Functions are deployed:
- `/.netlify/functions/graphql` - Proxies GraphQL requests
- `/.netlify/functions/assets/{id}` - Proxies asset requests

These functions handle CORS and allow HTTP → HTTPS conversion automatically.

### Important Notes

- ✅ No CORS configuration needed on Directus
- ✅ Works with HTTP backends (no SSL certificate required)
- ✅ Works with private network IPs (if reachable from Netlify)
- ✅ No mixed content errors
- ⚠️ Functions have execution time limits (typically 10 seconds)
- ⚠️ Assets are proxied on-demand (may be slower than direct access)
