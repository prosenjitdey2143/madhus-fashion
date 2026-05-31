import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '../types';
import { analyticsService } from '../services/analytics/analyticsService';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  savings: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    analyticsService.addToCart(newItem, newItem.quantity);
    setItems(current => {
      // Check if product+size already exists in cart
      const existingItem = current.find(
        i => i.productId === newItem.productId && i.size === newItem.size
      );

      if (existingItem) {
        return current.map(i => 
          i.id === existingItem.id 
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }

      // Add new item with generated ID (UUID placeholder)
      return [...current, { ...newItem, id: Math.random().toString(36).substr(2, 9) }];
    });
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(item => item.id === id);
    if (itemToRemove) {
      analyticsService.removeFromCart(itemToRemove, itemToRemove.quantity);
    }
    setItems(current => current.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    
    const existingItem = items.find(item => item.id === id);
    if (existingItem) {
      if (quantity > existingItem.quantity) {
        analyticsService.addToCart(existingItem, quantity - existingItem.quantity);
      } else if (quantity < existingItem.quantity) {
        analyticsService.removeFromCart(existingItem, existingItem.quantity - quantity);
      }
    }

    setItems(current => current.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  // LocalStorage persistence scaffolding
  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('madhus_cart');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Save to localStorage on change
    localStorage.setItem('madhus_cart', JSON.stringify(items));
  }, [items]);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      totalItems, totalPrice, savings, isCartOpen, setCartOpen: setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
