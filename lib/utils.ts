// Get the base URL for assets
const ASSETS_BASE_URL = import.meta.env.VITE_ASSETS_URL || 'http://10.43.0.43:8055/assets';

export function getAssetUrl(assetId: string | undefined): string {
  if (!assetId) {
    return 'https://via.placeholder.com/800x450?text=No+Image';
  }
  return `${ASSETS_BASE_URL}/${assetId}`;
}
