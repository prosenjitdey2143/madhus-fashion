import { 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  type User 
} from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import type { UserProfile } from "../../types";

export const authService = {
  /**
   * Listen to auth state changes and fetch user profile
   */
  onAuthStateChange: (callback: (user: UserProfile | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        // Fetch role and additional info from Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: data.displayName || null,
            role: data.role || "customer",
            createdAt: data.createdAt || new Date().toISOString()
          });
        } else {
          // Fallback if no Firestore profile exists yet
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: null,
            role: "customer",
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        callback(null);
      }
    });
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  },

  /**
   * Log in with Email and Password
   */
  login: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }
};
