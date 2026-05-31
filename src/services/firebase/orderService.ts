import { collection, serverTimestamp, doc, getDoc, query, where, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import type { Order } from "../../types";
import { MOCK_ORDERS } from "./mockData";

const ORDERS_COLLECTION = "orders";

/**
 * Generates a human-readable unique order ID.
 * Format: MF-YYYY-XXXXX (where X is alphanumeric)
 */
const generateOrderId = (): string => {
  const year = new Date().getFullYear();
  // Generate 5 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `MF-${year}-${randomPart}`;
};

export const orderService = {
  /**
   * Create a new order (Checkout Flow)
   */
  createOrder: async (orderData: Omit<Order, "orderId" | "createdAt">): Promise<string> => {
    try {
      const customId = generateOrderId();
      const docRef = doc(db, ORDERS_COLLECTION, customId);
      
      await setDoc(docRef, {
        orderId: customId,
        ...orderData,
        createdAt: serverTimestamp(),
      });
      
      return customId;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  },

  /**
   * Fetch order by ID
   */
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return MOCK_ORDERS.find(o => o.orderId === orderId) || null;
      }

      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { orderId: docSnap.id, ...docSnap.data() } as Order;
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      throw error;
    }
  },

  /**
   * Fetch all orders (Admin only)
   */
  getAllOrders: async (): Promise<Order[]> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return MOCK_ORDERS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
      const orders = querySnapshot.docs.map((doc: any) => ({
        orderId: doc.id,
        ...doc.data()
      } as Order));
      
      // Sort in memory by createdAt descending since it's a timestamp
      // Alternatively, could use a Firestore orderby query if indexed.
      return orders.sort((a, b) => {
        const timeA = a.createdAt ? (a.createdAt as any).toMillis?.() || 0 : 0;
        const timeB = b.createdAt ? (b.createdAt as any).toMillis?.() || 0 : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Failed to fetch all orders:", error);
      throw error;
    }
  },

  /**
   * Fetch orders for a specific user email
   */
  getUserOrders: async (email: string): Promise<Order[]> => {
    try {
      if (import.meta.env.VITE_FIREBASE_API_KEY === undefined || import.meta.env.VITE_FIREBASE_API_KEY === "" || import.meta.env.VITE_FIREBASE_API_KEY === "mock-key") {
        return MOCK_ORDERS.filter(o => o.customerInfo.email === email);
      }

      const q = query(
        collection(db, ORDERS_COLLECTION),
        where("customerInfo.email", "==", email)
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((doc: any) => ({
        orderId: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error(`Failed to fetch orders for ${email}:`, error);
      throw error;
    }
  },

  /**
   * Update an existing order
   */
  updateOrder: async (orderId: string, data: Partial<Omit<Order, "orderId" | "createdAt">>): Promise<void> => {
    try {
      const docRef = doc(db, ORDERS_COLLECTION, orderId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
      throw error;
    }
  }
};
