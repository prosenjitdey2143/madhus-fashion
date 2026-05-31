import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB1cn1K_B43Dzaqo7hNq_p2MD5FPPMUzSI",
  authDomain: "madhus-fashion.firebaseapp.com",
  projectId: "madhus-fashion",
  storageBucket: "madhus-fashion.firebasestorage.app",
  messagingSenderId: "989199848064",
  appId: "1:989199848064:web:c59b86ce7fb28b28e80c65"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const product = {
  name: "Exclusive Couture Gown",
  description: "A stunning one-of-a-kind piece from our new collection, featuring premium materials and an elegant modern silhouette.",
  price: 1500,
  category: "dresses",
  sizes: ["S", "M", "L"],
  stock: 5,
  images: ["https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992748/compressed_ChatGPT_Image_May_26_2026_06_55_39_PM_av99oa.jpg"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  featured: true,
  newArrival: true
};

async function seed() {
  try {
    console.log("Connecting to Firebase Firestore...");
    const docRef = await addDoc(collection(db, "products"), product);
    console.log("Success! Document written with ID: ", docRef.id);
    process.exit(0);
  } catch (e) {
    console.error("Error adding document: ", e);
    process.exit(1);
  }
}

seed();
