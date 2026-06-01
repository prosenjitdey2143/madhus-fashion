import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem, Coupon } from '../types';
import { analyticsService } from '../services/analytics/analyticsService';
import { couponService } from '../services/firebase/couponService';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number; // Subtotal before coupon
  savings: number;
  isCartOpen: boolean;
  setCartOpen: (isOpen: boolean) => void;
  // Coupon additions
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  couponDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Calculate totals
  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + (item.price * item.quantity), 0), [items]);
  const savings = useMemo(() => items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0), [items]);

  // Calculate Coupon Discount
  const couponDiscount = useMemo(() => {
    let discount = 0;
    if (appliedCoupon && items.length > 0) {
      if (appliedCoupon.type === 'percentage') {
        discount = totalPrice * (appliedCoupon.value / 100);
      } else {
        discount = appliedCoupon.value;
      }
      if (discount > totalPrice) {
        discount = totalPrice;
      }
    }
    return discount;
  }, [appliedCoupon, items.length, totalPrice]);

  // Auto-remove coupon if cart is empty or drops below minimum order value
  useEffect(() => {
    if (appliedCoupon) {
      if (items.length === 0) {
        setAppliedCoupon(null);
      } else if (appliedCoupon.minOrderValue && totalPrice < appliedCoupon.minOrderValue) {
        setAppliedCoupon(null);
      }
    }
  }, [items, totalPrice, appliedCoupon]);

  const applyCoupon = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) return { success: false, message: "Please enter a code." };
    
    try {
      const coupon = await couponService.getCouponByCode(code);
      
      if (!coupon) {
        return { success: false, message: "Invalid coupon code." };
      }
      if (!coupon.isActive) {
        return { success: false, message: "This coupon is no longer active." };
      }
      if (coupon.minOrderValue && totalPrice < coupon.minOrderValue) {
        return { success: false, message: `Minimum order value of ₹${coupon.minOrderValue} required.` };
      }

      setAppliedCoupon(coupon);
      return { success: true, message: "Coupon applied successfully!" };
    } catch (error) {
      return { success: false, message: "Error validating coupon. Try again." };
    }
  }, [totalPrice]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const addItem = useCallback((newItem: Omit<CartItem, 'id'>) => {
    analyticsService.addToCart(newItem, newItem.quantity);
    setItems(current => {
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

      return [...current, { ...newItem, id: Math.random().toString(36).substr(2, 9) }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(current => {
      const itemToRemove = current.find(item => item.id === id);
      if (itemToRemove) {
        analyticsService.removeFromCart(itemToRemove, itemToRemove.quantity);
      }
      return current.filter(item => item.id !== id);
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    
    setItems(current => {
      const existingItem = current.find(item => item.id === id);
      if (existingItem) {
        if (quantity > existingItem.quantity) {
          analyticsService.addToCart(existingItem, quantity - existingItem.quantity);
        } else if (quantity < existingItem.quantity) {
          analyticsService.removeFromCart(existingItem, existingItem.quantity - quantity);
        }
      }
      return current.map(item => item.id === id ? { ...item, quantity } : item);
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  // LocalStorage persistence scaffolding
  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('madhus_cart');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) {}
    }
    const savedCoupon = localStorage.getItem('madhus_coupon');
    if (savedCoupon) {
      try { setAppliedCoupon(JSON.parse(savedCoupon)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Save to localStorage on change
    localStorage.setItem('madhus_cart', JSON.stringify(items));
    if (appliedCoupon) {
      localStorage.setItem('madhus_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('madhus_coupon');
    }
  }, [items, appliedCoupon]);

  const contextValue = useMemo(() => ({
    items, addItem, removeItem, updateQuantity, clearCart, 
    totalItems, totalPrice, savings, isCartOpen, setCartOpen: setIsCartOpen,
    appliedCoupon, applyCoupon, removeCoupon, couponDiscount
  }), [
    items, addItem, removeItem, updateQuantity, clearCart,
    totalItems, totalPrice, savings, isCartOpen,
    appliedCoupon, applyCoupon, removeCoupon, couponDiscount
  ]);

  return (
    <CartContext.Provider value={contextValue}>
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
