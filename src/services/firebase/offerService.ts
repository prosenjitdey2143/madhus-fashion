import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { storageService } from "./storageService";
import type { Offer } from "../../types";

const OFFERS_COLLECTION = "offers";

export const offerService = {
  /**
   * Fetch all offers (for admin dashboard)
   */
  getAllOffers: async (): Promise<Offer[]> => {
    try {
      const q = query(collection(db, OFFERS_COLLECTION));
      const querySnapshot = await getDocs(q);
      
      const offers = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Offer));

      return offers.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error("Failed to fetch offers:", error);
      throw error;
    }
  },

  /**
   * Fetch only active offers (for storefront homepage)
   */
  getActiveOffers: async (): Promise<Offer[]> => {
    try {
      const q = query(
        collection(db, OFFERS_COLLECTION),
        where("active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      
      const now = new Date();
      
      // Filter out scheduled or expired offers on the client side since Firestore 
      // doesn't support multiple inequalities well.
      const offers = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as Offer)).filter(offer => {
        if (offer.startDate && new Date(offer.startDate) > now) return false;
        if (offer.endDate && new Date(offer.endDate) < now) return false;
        return true;
      });

      return offers.sort((a, b) => (a.priority || 0) - (b.priority || 0));
    } catch (error) {
      console.error("Failed to fetch active offers:", error);
      throw error;
    }
  },

  /**
   * Fetch a specific offer by ID
   */
  getOfferById: async (id: string): Promise<Offer | null> => {
    try {
      const docRef = doc(db, OFFERS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Offer;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch offer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new offer
   */
  createOffer: async (offerData: Omit<Offer, "id" | "createdAt" | "updatedAt">): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, OFFERS_COLLECTION), {
        ...offerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to create offer:", error);
      throw error;
    }
  },

  /**
   * Update an existing offer
   */
  updateOffer: async (id: string, updates: Partial<Omit<Offer, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
    try {
      const docRef = doc(db, OFFERS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Failed to update offer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete an offer and its associated banner image from storage
   */
  deleteOffer: async (id: string, bannerUrl?: string): Promise<void> => {
    try {
      // 1. Delete image from Storage
      if (bannerUrl) {
        try {
          await storageService.deleteImage(bannerUrl);
        } catch (e) {
          console.warn(`Failed to delete banner ${bannerUrl} from storage.`, e);
        }
      }

      // 2. Delete document from Firestore
      const docRef = doc(db, OFFERS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete offer ${id}:`, error);
      throw error;
    }
  }
};
