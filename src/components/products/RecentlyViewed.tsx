import React from 'react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { ProductCard } from '../../ui/ProductCard';

interface RecentlyViewedProps {
  currentProductId?: string;
}

export function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const { recentItems } = useRecentlyViewed();

  // Filter out the product currently being viewed
  const itemsToShow = recentItems.filter(item => item.id !== currentProductId);

  // If there's nothing to show after filtering, render nothing
  if (itemsToShow.length === 0) {
    return null;
  }

  return (
    <div className="py-16 md:py-24 border-t border-charcoal/10 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-4">
              Recently Viewed
            </h2>
            <p className="text-charcoal/60 max-w-2xl text-sm md:text-base">
              Pick up right where you left off.
            </p>
          </div>
        </div>

        {/* Scrollable container on mobile, grid on desktop */}
        <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8 snap-x md:snap-none hide-scrollbar">
          {itemsToShow.map((item) => (
            <div key={item.id} className="w-[70vw] md:w-auto flex-shrink-0 snap-start">
              <ProductCard
                id={item.id}
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                imageUrl={item.imageUrl}
                badge={item.badge}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
