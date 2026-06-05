// VITE_IMAGE_PROXY_URL should look like: https://ik.imagekit.io/your_id/
const PROXY_URL = import.meta.env.VITE_IMAGE_PROXY_URL;

/**
 * Returns an optimized version of the image URL if a proxy is configured.
 * Automatically converts to WebP and scales to the requested width.
 */
export function getOptimizedImageUrl(originalUrl: string, width?: number): string {
  if (!originalUrl) return '';
  
  const safeUrl = originalUrl.replace(/ /g, '%20');
  
  // If no proxy is set, or if the URL is a relative path/data URI, return original
  if (!PROXY_URL || !safeUrl.startsWith('http')) {
    return safeUrl;
  }
  
  const baseUrl = PROXY_URL.endsWith('/') ? PROXY_URL.slice(0, -1) : PROXY_URL;
  
  // Build transformation string e.g. "tr:f-webp,q-90,w-400"
  const transformations = ['f-webp', 'q-90'];
  if (width) {
    transformations.push(`w-${width}`);
  }
  const trString = `tr:${transformations.join(',')}`;
  
  // If the user pasted an ImageKit URL directly (e.g. from their Media Library),
  // we just insert the transformation string into the URL rather than proxying it twice.
  if (safeUrl.startsWith(baseUrl)) {
    const path = safeUrl.slice(baseUrl.length);
    // path might start with a slash
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${baseUrl}/${trString}/${cleanPath}`;
  }
  
  // Otherwise, use the Web Proxy approach for external URLs
  return `${baseUrl}/${trString}/${safeUrl}`;
}
