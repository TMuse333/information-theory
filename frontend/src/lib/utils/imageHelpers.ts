/**
 * Image Helper Utilities
 */

/**
 * Check if a logo URL is safe to use with Next.js Image component
 * Only allows:
 * - Local paths (starting with /)
 * - Vercel Blob storage URLs
 * - Configured remote patterns
 */
export function isSafeImageUrl(url: string | undefined): boolean {
  if (!url) return false;

  // Allow local paths
  if (url.startsWith('/')) return true;

  // Allow Vercel Blob storage
  if (url.includes('blob.vercel-storage.com')) return true;

  // Allow any other configured domains here
  // if (url.includes('your-cdn.com')) return true;

  // Block all other external URLs (like example.com, fasttrack.com, etc.)
  return false;
}

/**
 * Get a safe image URL, falling back to placeholder for invalid URLs
 */
export function getSafeImageUrl(url: string | undefined, fallback: string = '/placeholder.webp'): string {
  return isSafeImageUrl(url) ? url! : fallback;
}
