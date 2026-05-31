import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const SETTINGS_DOC_ID = "store_settings";
const SETTINGS_COLLECTION = "settings";

export interface StoreSettings {
  whatsappNumber: string;
  upiId: string;
  qrCodeUrl: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  whatsappNumber: "919163253013", // Fallback to provided number, Assuming 91 is country code
  upiId: "madhusfashion@upi",
  qrCodeUrl: ""
};

export const storeSettingsService = {
  /**
   * Get store settings
   */
  getSettings: async (): Promise<StoreSettings> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return DEFAULT_SETTINGS;
      }

      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { ...DEFAULT_SETTINGS, ...docSnap.data() } as StoreSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Failed to fetch store settings:", error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update store settings
   */
  updateSettings: async (settings: Partial<StoreSettings>): Promise<void> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        console.log("Mock update settings:", settings);
        return;
      }

      const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      await setDoc(docRef, settings, { merge: true });
    } catch (error) {
      console.error("Failed to update store settings:", error);
      throw error;
    }
  }
};
