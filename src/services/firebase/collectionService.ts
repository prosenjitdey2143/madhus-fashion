import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { storageService } from "./storageService";

const COLLECTIONS_DB = "collections";

export interface DBCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export const collectionService = {
  /**
   * Fetch all collections (for admin dashboard)
   */
  getAllCollections: async (): Promise<DBCollection[]> => {
    try {
      const q = query(collection(db, COLLECTIONS_DB));
      const querySnapshot = await getDocs(q);
      
      const collections = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as DBCollection));

      return collections.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      throw error;
    }
  },

  /**
   * Fetch only active collections (for storefront homepage)
   */
  getActiveCollections: async (): Promise<DBCollection[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS_DB),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      
      const collections = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as DBCollection));

      return collections.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error("Failed to fetch active collections:", error);
      throw error;
    }
  },

  /**
   * Fetch a specific collection by ID
   */
  getCollectionById: async (id: string): Promise<DBCollection | null> => {
    try {
      const docRef = doc(db, COLLECTIONS_DB, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DBCollection;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch collection ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new collection
   */
  createCollection: async (collectionData: Omit<DBCollection, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS_DB), {
        ...collectionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to create collection:", error);
      throw error;
    }
  },

  /**
   * Update an existing collection
   */
  updateCollection: async (id: string, updates: Partial<Omit<DBCollection, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS_DB, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update collection ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a collection and its associated image from storage
   */
  deleteCollection: async (id: string, imageUrl?: string): Promise<void> => {
    try {
      // 1. Delete image from Storage
      if (imageUrl) {
        try {
          await storageService.deleteImage(imageUrl);
        } catch (e) {
          console.warn(`Failed to delete collection image ${imageUrl} from storage.`, e);
        }
      }

      // 2. Delete document from Firestore
      const docRef = doc(db, COLLECTIONS_DB, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete collection ${id}:`, error);
      throw error;
    }
  }
};
