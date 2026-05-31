import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebaseConfig"
import type { TrendingSettings } from "../../types"

const TRENDING_DOC_ID = "trendingNow"

export const trendingService = {
  getTrendingSettings: async (): Promise<TrendingSettings | null> => {
    try {
      const docRef = doc(db, "settings", TRENDING_DOC_ID)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data() as TrendingSettings
      }
      return null
    } catch (error) {
      console.error("Error getting trending settings:", error)
      throw error
    }
  },

  saveTrendingSettings: async (settings: TrendingSettings): Promise<void> => {
    try {
      const docRef = doc(db, "settings", TRENDING_DOC_ID)
      await setDoc(docRef, settings, { merge: true })
    } catch (error) {
      console.error("Error saving trending settings:", error)
      throw error
    }
  }
}
