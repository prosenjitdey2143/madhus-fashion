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

const imageUrls = [
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992743/compressed_ChatGPT_Image_May_26_2026_06_27_13_PM_ltr7dz.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992742/compressed_ChatGPT_Image_May_26_2026_06_29_27_PM_d6sqrb.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992741/compressed_ChatGPT_Image_May_26_2026_06_21_18_PM_a1aqz5.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992738/compressed_ChatGPT_Image_May_26_2026_06_16_55_PM_zglpxj.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992737/compressed_ChatGPT_Image_May_26_2026_06_11_52_PM_yonc3n.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992734/compressed_ChatGPT_Image_May_26_2026_05_50_04_PM_wxzucv.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992732/compressed_ChatGPT_Image_May_26_2026_05_38_00_PM_xenspc.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992730/compressed_ChatGPT_Image_May_26_2026_05_15_19_PM_hiplmi.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992726/compressed_ChatGPT_Image_May_26_2026_05_07_44_PM_v0kcpv.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992724/compressed_ChatGPT_Image_May_26_2026_05_02_17_PM_q308li.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992723/compressed_ChatGPT_Image_May_26_2026_05_00_25_PM_uwraqw.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992721/compressed_ChatGPT_Image_May_26_2026_04_54_41_PM_olfhd4.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992717/compressed_ChatGPT_Image_May_26_2026_04_44_38_PM_l2jfid.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992717/compressed_ChatGPT_Image_May_26_2026_04_47_36_PM_ltwthh.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992715/compressed_ChatGPT_Image_May_26_2026_04_39_13_PM_wpi0ts.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992712/compressed_ChatGPT_Image_May_26_2026_04_36_27_PM_smpo7q.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992711/compressed_ChatGPT_Image_May_26_2026_04_34_08_PM_fxkeqm.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992709/compressed_ChatGPT_Image_May_26_2026_04_31_11_PM_docddp.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992652/compressed_ChatGPT_Image_May_26_2026_04_23_47_PM_ru6ph7.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992650/compressed_ChatGPT_Image_May_26_2026_04_17_47_PM_ppawci.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992646/compressed_ChatGPT_Image_May_26_2026_04_09_53_PM_yqss9c.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992646/compressed_ChatGPT_Image_May_26_2026_04_07_15_PM_v8gjvh.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992641/compressed_ChatGPT_Image_May_26_2026_04_03_29_PM_iveorm.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992639/compressed_ChatGPT_Image_May_26_2026_02_45_57_PM_ajsqjp.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992639/compressed_ChatGPT_Image_May_26_2026_02_20_10_PM_yfniu3.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992636/compressed_ChatGPT_Image_May_26_2026_02_17_58_PM_ehbhlp.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992633/compressed_1779879629963_lhmgcg.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992633/compressed_ChatGPT_Image_May_26_2026_02_08_31_PM_i5ascu.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992632/compressed_ChatGPT_Image_May_26_2026_01_57_27_PM_xkoo4d.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992629/compressed_1779879629948_qbhk2o.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992626/compressed_1779879629934_ct7mdb.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992625/compressed_1779879629918_h0rxks.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992623/compressed_1779879629850_dbxneo.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992623/compressed_1779879629901_hkazos.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992619/compressed_1779879629819_etnxka.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992617/compressed_1779879629836_ad1pja.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992616/compressed_1779879629804_rgeysn.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992613/compressed_1779879629790_lki5b9.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992611/compressed_1779879629772_rndi9b.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992610/compressed_1779879629757_vo1dyp.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992607/compressed_1779879629740_sz8fcy.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992606/compressed_1779879629721_besfqt.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992603/compressed_1779879629700_pewzce.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992602/compressed_1779879629682_ti9cjm.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992600/compressed_1779879629667_twh1oi.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992598/compressed_1779879629650_cm3amo.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992597/compressed_1779879629633_oueadj.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992594/compressed_1779879629613_efbvgb.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992593/compressed_1779879629597_jh02m6.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/v1779992590/compressed_1779879629581_izh1bb.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992590/compressed_1779879629553_tdpqfw.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992588/compressed_1779879629564_hvddr0.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992585/compressed_1779879629519_bx2z9x.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992583/compressed_1779879629538_olfpzs.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992582/compressed_1779879629500_rmeez6.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992578/compressed_1779879629460_amahiu.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992578/compressed_ChatGPT_Image_May_26_2026_07_07_58_PM_boxby5.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992577/compressed_1779879629481_olgjni.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992577/compressed_1779879629442_tvrr7d.jpg",
  "https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992576/compressed__storage_emulated_0_Download_ChatGPT_Image_May_26_2026_06_38_59_PM_zzrmmo.jpg"
];

const ADJECTIVES = ["Silk", "Velvet", "Cashmere", "Embroidered", "Pleated", "Draped", "Structured", "Tailored", "Woven", "Minimalist"];
const NOUNS = ["Maxi", "Midi", "Gown", "Blouse", "Trousers", "Wrap", "Tunic", "Jacket", "Coat", "Dress"];
const COLORS = ["Midnight", "Ivory", "Crimson", "Emerald", "Charcoal", "Rose Nude", "Champagne", "Sapphire", "Amber", "Obsidian"];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDummyData(imageUrl, index) {
  const name = `${getRandom(COLORS)} ${getRandom(ADJECTIVES)} ${getRandom(NOUNS)}`;
  const price = Math.floor(Math.random() * (1200 - 150 + 1) + 150);
  
  return {
    name: name,
    description: `A breathtaking piece from the Madhus Fashion exclusive collection. Features meticulous craftsmanship and a timeless silhouette designed for the modern wardrobe.`,
    price: price,
    category: "dresses",
    sizes: ["XS", "S", "M", "L"],
    stock: Math.floor(Math.random() * 20) + 1,
    images: [imageUrl],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    featured: index < 8, // Feature first 8
    newArrival: index % 3 === 0
  };
}

async function seed() {
  console.log(`Starting to seed ${imageUrls.length} products to Firebase...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const product = generateDummyData(imageUrls[i], i);
      const docRef = await addDoc(collection(db, "products"), product);
      console.log(`[${i+1}/${imageUrls.length}] Added: ${product.name} (${docRef.id})`);
      successCount++;
    } catch (e) {
      console.error(`[${i+1}/${imageUrls.length}] Failed to add product:`, e);
      failCount++;
    }
  }

  console.log(`\n✅ Finished seeding! Successfully added ${successCount} products. Failed: ${failCount}`);
  process.exit(0);
}

seed();
