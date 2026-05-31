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

const DEFAULT_COLLECTIONS = [
  {
    title: "The Diwali Edit",
    description: "Gleam in opulent hand-woven silk sarees and gold embroidered outfits made for festive nights.",
    image: "/diwali_lookbook.png",
    link: "/products?collection=diwali"
  },
  {
    title: "Durga Puja Couture",
    description: "Bespoke crimson and classic ivory ensembles tailored for spectacular cultural celebration rituals.",
    image: "/durgapuja_lookbook.png",
    link: "/products?collection=durgapuja"
  },
  {
    title: "Holika Milan Edit",
    description: "Bask in soft pastel muslins and light organzas decorated with floral hues for Holi celebrations.",
    image: "/holi_lookbook.png",
    link: "/products?collection=holi"
  },
  {
    title: "Eid Luxury Selection",
    description: "Exquisite Anarkalis, tailored fusion wear, and premium pastel pieces crafted for celebratory dinners.",
    image: "/eid_lookbook.png",
    link: "/products?collection=eid"
  },
  {
    title: "Bhai Dooj Specials",
    description: "Elegant, semi-formal traditional wear to celebrate sacred familial bonds and classic customs.",
    image: "/bhaidudh_lookbook.png",
    link: "/products?collection=bhaidudh"
  },
  {
    title: "Winter Solstice Edit",
    description: "Stay warm in structured cashmere trench coats, fine wool shawls, and premium seasonal layers.",
    image: "/winter_lookbook.png",
    link: "/products?collection=winter"
  },
  {
    title: "Nightfall Party Styles",
    description: "Command the room in structured evening blazers, liquid satins, and shimmering party coordinates.",
    image: "/party_lookbook.png",
    link: "/products?collection=party"
  },
  {
    title: "Office Elegance",
    description: "Sharp contemporary tailoring and sophisticated matching coordinates for effortless workplace styling.",
    image: "/office_lookbook.png",
    link: "/products?collection=office"
  },
  {
    title: "Sun-Drenched Picnic",
    description: "Flowy, relaxed linen dresses and sunhat-ready floral prints crafted for blissful outdoor afternoons.",
    image: "/picnic_lookbook.png",
    link: "/products?collection=picnic"
  }
];

async function seed() {
  console.log(`Starting to seed ${DEFAULT_COLLECTIONS.length} collections to Firebase...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < DEFAULT_COLLECTIONS.length; i++) {
    try {
      const collectionData = {
        ...DEFAULT_COLLECTIONS[i],
        active: true,
        priority: 100 - i, // Highest priority first
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "collections"), collectionData);
      console.log(`[${i+1}/${DEFAULT_COLLECTIONS.length}] Added: ${collectionData.title} (${docRef.id})`);
      successCount++;
    } catch (e) {
      console.error(`[${i+1}/${DEFAULT_COLLECTIONS.length}] Failed to add collection:`, e);
      failCount++;
    }
  }

  console.log(`\n✅ Finished seeding! Successfully added ${successCount} collections. Failed: ${failCount}`);
  process.exit(0);
}

seed();
