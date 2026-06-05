import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from "fs";

// Read firebase config from file
const content = fs.readFileSync("./src/services/firebase/firebaseConfig.ts", "utf8");
const configMatch = content.match(/const firebaseConfig = ({[\s\S]*?});/);
if (!configMatch) {
  console.error("Could not find config");
  process.exit(1);
}

// Convert unquoted keys to quoted keys for JSON parse
let configStr = configMatch[1]
  .replace(/import\.meta\.env\.VITE_FIREBASE_API_KEY/g, `"${process.env.VITE_FIREBASE_API_KEY}"`)
  // Wait, process.env doesn't have the VITE_ variables here.
  // The variables are in .env
