import { collection, doc, getDoc, query, where, limit, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { storageService } from "./storageService";
import type { Product } from "../../types";

const PRODUCTS_COLLECTION = "products";

export const productService = {
  /**
   * Fetch all products (future: add pagination/limits)
   */
  getProducts: async (): Promise<Product[]> => {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  },

  /**
   * Fetch a specific product by ID
   */
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch featured products for homepage
   */
  getFeaturedProducts: async (count: number = 4): Promise<Product[]> => {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where("featured", "==", true),
        limit(count)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Product));
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      throw error;
    }
  },

  /**
   * Create a new product
   */
  createProduct: async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to create product:", error);
      throw error;
    }
  },

  /**
   * Update an existing product
   */
  updateProduct: async (id: string, updates: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a product and its associated images from storage
   */
  deleteProduct: async (id: string, imageUrls: string[] = []): Promise<void> => {
    try {
      // 1. Delete all associated images from Firebase Storage
      if (imageUrls && imageUrls.length > 0) {
        const deletePromises = imageUrls.map(url => 
          storageService.deleteImage(url).catch(e => {
            console.warn(`Failed to delete image ${url} from storage. It may have already been deleted.`, e);
          })
        );
        await Promise.all(deletePromises);
      }

      // 2. Delete the document from Firestore
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete product ${id}:`, error);
      throw error;
    }
  }
};
