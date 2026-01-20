import type { Handler, HandlerEvent } from '@netlify/functions';

const ASSETS_BASE_URL = process.env.DIRECTUS_ASSETS_URL || 'http://10.43.0.43:8055/assets';

export const handler: Handler = async (event: HandlerEvent) => {
  // Get the asset ID from the path
  const assetId = event.path.replace('/.netlify/functions/assets/', '').replace('/.netlify/functions/assets', '');

  if (!assetId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Asset ID required' }),
    };
  }

  try {
    const assetUrl = `${ASSETS_BASE_URL}/${assetId}`;
    const response = await fetch(assetUrl);

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Asset not found' }),
      };
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Asset proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch asset' }),
    };
  }
};
