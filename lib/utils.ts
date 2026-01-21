// Get the base URL for assets
// Use Vite proxy in development, Directus directly in production
const ASSETS_BASE_URL = import.meta.env.DEV
  ? '/assets'
  : 'https://directus.phitopolis.io/assets';

export function getAssetUrl(assetId: string | undefined): string {
  if (!assetId) {
    return 'https://via.placeholder.com/800x450?text=No+Image';
  }
  return `${ASSETS_BASE_URL}/${assetId}`;
}
