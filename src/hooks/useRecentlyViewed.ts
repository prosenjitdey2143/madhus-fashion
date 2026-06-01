import { useState, useEffect, useCallback } from 'react';
import type { ProductCardProps } from '../ui/ProductCard';

const STORAGE_KEY = 'madhus_recently_viewed';
const MAX_ITEMS = 10;

// Omit className from ProductCardProps for storage
export type RecentlyViewedItem = Omit<ProductCardProps, 'className'>;

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentlyViewedItem[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to parse recently viewed items from local storage', error);
    }
  }, []);

  const addRecentlyViewed = useCallback((product: RecentlyViewedItem) => {
    setRecentItems((prev) => {
      // Remove the item if it already exists in the list to avoid duplicates
      const filtered = prev.filter(item => item.id !== product.id);
      
      // Add the new item to the front of the array
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save recently viewed items to local storage', error);
      }
      
      return updated;
    });
  }, []);

  return {
    recentItems,
    addRecentlyViewed
  };
}
