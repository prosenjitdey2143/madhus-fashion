import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { storageService } from "./storageService";
import type { Category } from "../../types";

const CATEGORIES_COLLECTION = "categories";

export const categoryService = {
  /**
   * Fetch all categories (for admin dashboard)
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const q = query(collection(db, CATEGORIES_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const categories = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Category));

      return categories.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

  /**
   * Fetch only active categories (for storefront homepage)
   */
  getActiveCategories: async (): Promise<Category[]> => {
    try {
      const q = query(
        collection(db, CATEGORIES_COLLECTION),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      
      const categories = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Category));

      return categories.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error("Failed to fetch active categories:", error);
      throw error;
    }
  },

  /**
   * Fetch a specific category by ID
   */
  getCategoryById: async (id: string): Promise<Category | null> => {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Category;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
        ...categoryData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id: string, updates: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
    try {
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a category and its associated image from storage
   */
  deleteCategory: async (id: string, imageUrl?: string): Promise<void> => {
    try {
      // 1. Delete image from Storage
      if (imageUrl) {
        try {
          await storageService.deleteImage(imageUrl);
        } catch (e) {
          console.warn(`Failed to delete category image ${imageUrl} from storage.`, e);
        }
      }

      // 2. Delete document from Firestore
      const docRef = doc(db, CATEGORIES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  }
};
