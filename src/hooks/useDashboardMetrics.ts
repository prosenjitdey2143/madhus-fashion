import { useState, useEffect } from 'react';
import { productService } from '../services/firebase/productService';
import { orderService } from '../services/firebase/orderService';
import type { Order } from '../types';

export interface DashboardMetrics {
  totalRevenue: number;
  activeOrders: number;
  productCatalogSize: number;
  lowStockCount: number;
  recentOrders: Order[];
  loading: boolean;
  error: string | null;
}

export function useDashboardMetrics(): DashboardMetrics {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    activeOrders: 0,
    productCatalogSize: 0,
    lowStockCount: 0,
    recentOrders: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchMetrics() {
      try {
        // Fetch both products and orders in parallel for performance
        const [products, orders] = await Promise.all([
          productService.getProducts(),
          orderService.getAllOrders()
        ]);

        if (!isMounted) return;

        // Calculate Revenue (all non-cancelled orders)
        const totalRevenue = orders.reduce((sum, order) => {
          if (order.orderStatus !== 'cancelled') {
            return sum + order.amount.total;
          }
          return sum;
        }, 0);

        // Active Orders (processing or shipped)
        const activeOrders = orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'shipped').length;

        // Product Catalog Size
        const productCatalogSize = products.length;

        // Low Stock Count (<= 5)
        const lowStockCount = products.filter(p => p.stock <= 5).length;

        // Recent Orders (Top 5)
        const recentOrders = orders.slice(0, 5);

        setMetrics({
          totalRevenue,
          activeOrders,
          productCatalogSize,
          lowStockCount,
          recentOrders,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        if (isMounted) {
          console.error("Failed to load dashboard metrics:", error);
          setMetrics(prev => ({
            ...prev,
            loading: false,
            error: "Failed to load metrics. Please try again."
          }));
        }
      }
    }

    fetchMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  return metrics;
}
