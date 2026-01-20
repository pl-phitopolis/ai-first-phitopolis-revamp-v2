import type { Handler, HandlerEvent } from '@netlify/functions';

const GRAPHQL_ENDPOINT = process.env.DIRECTUS_GRAPHQL_URL || 'http://10.43.0.43:8055/graphql';

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.body,
    });

    const data = await response.text();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: data,
    };
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from GraphQL endpoint' }),
    };
  }
};
