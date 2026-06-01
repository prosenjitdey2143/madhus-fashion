import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { Coupon } from '../../types';

const COUPONS_COLLECTION = 'coupons';

export const couponService = {
  /**
   * Fetch all coupons
   */
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return [];
      }

      const querySnapshot = await getDocs(collection(db, COUPONS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Coupon));
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      throw error;
    }
  },

  /**
   * Fetch a single coupon by its ID
   */
  getCouponById: async (id: string): Promise<Coupon | null> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return null;
      }
      
      const docRef = doc(db, COUPONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Coupon;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch coupon ${id}:`, error);
      throw error;
    }
  },

  /**
   * Fetch a single coupon by its code (e.g. WELCOME10)
   */
  getCouponByCode: async (code: string): Promise<Coupon | null> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        // Mock fallback for development
        if (code.toUpperCase() === 'WELCOME10') {
          return {
            id: 'mock-coupon-1',
            code: 'WELCOME10',
            type: 'percentage',
            value: 10,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return null;
      }

      const q = query(
        collection(db, COUPONS_COLLECTION),
        where("code", "==", code.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Coupon;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch coupon by code ${code}:`, error);
      throw error;
    }
  },

  /**
   * Create a new coupon
   */
  createCoupon: async (couponData: Omit<Coupon, 'id'>): Promise<string> => {
    try {
      const docRef = doc(collection(db, COUPONS_COLLECTION));
      const dataToSave = {
        ...couponData,
        code: couponData.code.toUpperCase(), // Ensure uppercase
        id: docRef.id
      };
      await setDoc(docRef, dataToSave);
      return docRef.id;
    } catch (error) {
      console.error("Failed to create coupon:", error);
      throw error;
    }
  },

  /**
   * Update an existing coupon
   */
  updateCoupon: async (id: string, data: Partial<Omit<Coupon, 'id'>>): Promise<void> => {
    try {
      const docRef = doc(db, COUPONS_COLLECTION, id);
      const updateData = { ...data };
      if (updateData.code) {
        updateData.code = updateData.code.toUpperCase();
      }
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Failed to update coupon ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a coupon
   */
  deleteCoupon: async (id: string): Promise<void> => {
    try {
      const docRef = doc(db, COUPONS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Failed to delete coupon ${id}:`, error);
      throw error;
    }
  }
};
