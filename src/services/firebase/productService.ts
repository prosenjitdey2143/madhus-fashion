import { collection, doc, getDoc, query, where, limit, getDocs, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { storageService } from "./storageService";
import type { Product } from "../../types";
import { MOCK_PRODUCTS } from "./mockData";

const PRODUCTS_COLLECTION = "products";

export const productService = {
  /**
   * Fetch all products (future: add pagination/limits)
   */
  getProducts: async (): Promise<Product[]> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return MOCK_PRODUCTS;
      }
      
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
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return MOCK_PRODUCTS.find(p => p.id === id) || null;
      }

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
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return MOCK_PRODUCTS.slice(0, count);
      }

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
  },

  /**
   * Seed the database with mock products if it's empty
   * (Utility for initial setup)
   */
  seedMockProducts: async (): Promise<void> => {
    try {
      const q = query(collection(db, PRODUCTS_COLLECTION), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return; // Already seeded
      }

      console.log("Seeding mock products...");
      const mockProducts: Omit<Product, "id">[] = [
        {
          name: "Midnight Silk Slip Dress",
          price: 290,
          description: "Crafted from 100% pure mulberry silk, this slip dress falls effortlessly over the body.",
          category: "Dresses",
          sizes: ['XS', 'S', 'M', 'L'],
          stock: 15,
          images: ["https://images.unsplash.com/photo-1566206091558-f62f3a8f5e6a?q=80&w=987&auto=format&fit=crop"],
          featured: true,
          newArrival: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Ivory Draped Maxi",
          price: 450,
          description: "An elegant draped maxi perfect for modern evening elegance.",
          category: "Dresses",
          sizes: ['S', 'M', 'L'],
          stock: 8,
          images: ["https://images.unsplash.com/photo-1515347619362-e610d05770d1?q=80&w=987&auto=format&fit=crop"],
          featured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Charcoal Structured Midi",
          price: 320,
          originalPrice: 380,
          description: "Structured midi dress in premium charcoal fabric.",
          category: "Dresses",
          sizes: ['XS', 'S', 'M'],
          stock: 5,
          images: ["https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1026&auto=format&fit=crop"],
          bestSeller: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Rose Nude Halter Gown",
          price: 520,
          description: "A breathtaking halter gown in a soft rose nude shade.",
          category: "Gowns",
          sizes: ['S', 'M'],
          stock: 2,
          images: ["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=987&auto=format&fit=crop"],
          bestSeller: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Emerald Evening Wrap",
          price: 210,
          description: "Luxurious emerald wrap for elegant layering.",
          category: "Outerwear",
          sizes: ['One Size'],
          stock: 20,
          images: ["https://images.unsplash.com/photo-1572804013309-82a891485c8e?q=80&w=1000&auto=format&fit=crop"],
          newArrival: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: "Champagne Velvet Mini",
          price: 275,
          description: "A chic velvet mini dress in glowing champagne.",
          category: "Dresses",
          sizes: ['XS', 'L'],
          stock: 0,
          images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1083&auto=format&fit=crop"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      const batch = mockProducts.map(p => addDoc(collection(db, PRODUCTS_COLLECTION), p));
      await Promise.all(batch);
      console.log("Seeding complete.");
    } catch (error) {
      console.error("Failed to seed database (likely permissions or mock config):", error);
    }
  }
};
