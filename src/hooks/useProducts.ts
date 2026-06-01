import { useState, useEffect } from 'react';
import { productService } from '../services/firebase/productService';
import type { Product } from '../types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("useProducts Error:", err);
        setError("Failed to load collection. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
}

export function useFeaturedProducts() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setFeatured(data.filter(p => p.featured).slice(0, 4));
        setBestSellers(data.filter(p => p.bestSeller).slice(0, 3));
        setNewArrivals(data.filter(p => p.newArrival).slice(0, 4));
      } catch (err) {
        console.error("useFeaturedProducts Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return { featured, bestSellers, newArrivals, loading };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError("Product not found.");
        }
      } catch (err) {
        console.error("useProduct Error:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
}
