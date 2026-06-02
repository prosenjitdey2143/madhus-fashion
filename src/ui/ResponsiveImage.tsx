import React from 'react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /**
   * If true, it skips generating the srcset and just loads the original image.
   * Useful for very small icons or SVGs.
   */
  skipOptimization?: boolean;
}

export function ResponsiveImage({ 
  src, 
  alt, 
  className,
  loading = 'lazy', // Default to lazy loading for performance
  decoding = 'async', // Default async decoding
  skipOptimization = false,
  ...props 
}: ResponsiveImageProps) {
  
  if (!src || skipOptimization) {
    return <img src={src} alt={alt} className={className} loading={loading} decoding={decoding} {...props} />;
  }

  // The base src should be a medium/large size as a fallback for browsers that don't support srcset
  const baseSrc = getOptimizedImageUrl(src, 800);
  
  // Generate small, medium, and large versions
  const smallSrc = getOptimizedImageUrl(src, 400);
  const mediumSrc = getOptimizedImageUrl(src, 800);
  const largeSrc = getOptimizedImageUrl(src, 1200);
  const xlSrc = getOptimizedImageUrl(src, 1600);
  const xxlSrc = getOptimizedImageUrl(src, 2000);

  // If there's no proxy URL configured in .env, the utility returns the exact original URL.
  // In that case, srcset will just list the same URL 3 times, which the browser safely ignores.
  const srcSet = `
    ${smallSrc} 400w,
    ${mediumSrc} 800w,
    ${largeSrc} 1200w,
    ${xlSrc} 1600w,
    ${xxlSrc} 2000w
  `;

  // Provide sizes hints to the browser based on typical container widths
  // This says: On mobile (<768px), image takes full width. 
  // On tablet (<1200px), it takes half width.
  // On desktop, it takes a third width (e.g., 3-4 column grid).
  const sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

  return (
    <img
      src={baseSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
}
