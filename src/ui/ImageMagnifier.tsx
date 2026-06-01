import { useState, type MouseEvent, useRef } from 'react';
import { getOptimizedImageUrl } from '../utils/imageOptimization';
import { cn } from '../utils/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  className?: string;
  zoomLevel?: number;
}

export function ImageMagnifier({ src, alt, className, zoomLevel = 2.5 }: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  // Position is stored as percentages (0-100)
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const optimizedSrc = getOptimizedImageUrl(src, 1600);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate raw mouse position as percentage
    let x = ((e.clientX - left) / width) * 100;
    let y = ((e.clientY - top) / height) * 100;

    // Constrain the lens so it doesn't go outside the image
    // The lens width/height is (100 / zoomLevel)%
    const lensSize = 100 / zoomLevel;
    const halfLens = lensSize / 2;

    x = Math.max(halfLens, Math.min(100 - halfLens, x));
    y = Math.max(halfLens, Math.min(100 - halfLens, y));

    setPosition({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full cursor-zoom-in group bg-brand-pale", className)}
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Original Image */}
      <img loading="lazy" src={getOptimizedImageUrl(src, 800)}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
      />

      {/* The Lens (Shadow box over the image) */}
      {showMagnifier && (
        <div 
          className="absolute pointer-events-none border border-brand-text/30 bg-black/5"
          style={{
            width: `${100 / zoomLevel}%`,
            height: `${100 / zoomLevel}%`,
            top: `${position.y}%`,
            left: `${position.x}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 9999px rgba(255, 255, 255, 0.4)' // Dim the rest of the image
          }}
        />
      )}

      {/* The External Zoom Box */}
      <AnimatePresence>
        {showMagnifier && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[100] bg-white border-l border-brand-text/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] pointer-events-none overflow-hidden"
            style={{
              top: 0,
              left: "100%", // Right next to the image
              marginLeft: "3rem", // gap
              width: "450px", // Fixed large size for the zoom result
              height: "600px",
              backgroundImage: `url("${optimizedSrc}")`,
              backgroundRepeat: "no-repeat",
              // The background size is zoomLevel * 100% of the container size
              backgroundSize: `${zoomLevel * 100}%`,
              // We map the lens position to the background position
              // Since backgroundPosition is 0% to 100%, we calculate it based on the constrained lens position.
              // To map x from [halfLens, 100 - halfLens] to [0%, 100%]:
              backgroundPosition: `
                ${((position.x - (100 / zoomLevel / 2)) / (100 - (100 / zoomLevel))) * 100}% 
                ${((position.y - (100 / zoomLevel / 2)) / (100 - (100 / zoomLevel))) * 100}%
              `
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
