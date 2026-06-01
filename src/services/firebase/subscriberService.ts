import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore"
import { db } from "./firebaseConfig"

export interface Subscriber {
  id?: string;
  phone: string;
  createdAt: any;
}

const COLLECTION_NAME = "subscribers"

export const subscriberService = {
  // Add a new subscriber
  addSubscriber: async (phone: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        phone,
        createdAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding subscriber:", error)
      throw error
    }
  },

  // Fetch all subscribers
  getSubscribers: async (): Promise<Subscriber[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const subscribers: Subscriber[] = [];
      querySnapshot.forEach((doc) => {
        subscribers.push({ id: doc.id, ...doc.data() } as Subscriber);
      });
      return subscribers;
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      throw error;
    }
  }
}
