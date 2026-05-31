import type { Product, Order } from "../../types";

export const MOCK_PRODUCTS: Product[] = [
  // New Added Products
  {
    id: "p_cloud_1",
    name: "Exclusive Couture Gown",
    description: "A stunning one-of-a-kind piece from our new collection, featuring premium materials and an elegant modern silhouette.",
    price: 1500,
    category: "dresses",
    sizes: ["S", "M", "L"],
    stock: 5,
    images: ["https://res.cloudinary.com/diyyc9xt0/image/upload/q_auto/f_auto/v1779992748/compressed_ChatGPT_Image_May_26_2026_06_55_39_PM_av99oa.jpg"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Category: Dresses
  {
    id: "p1",
    name: "Midnight Silk Gown",
    description: "An elegant midnight blue silk gown with a sweeping train, perfect for evening galas. Hand-stitched detailing along the bodice.",
    price: 1200,
    category: "dresses",
    sizes: ["S", "M", "L"],
    stock: 15,
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p2",
    name: "Crimson Velvet Midi",
    description: "A bold crimson velvet dress that strikes the perfect balance between modern edge and classic romance.",
    price: 850,
    originalPrice: 1200,
    discount: 29,
    category: "dresses",
    sizes: ["XS", "S", "M", "L"],
    stock: 8,
    bestSeller: true,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p3",
    name: "Ivory Lace Bridal Dress",
    description: "Delicate ivory lace overlays a silk slip in this stunning bridal-inspired creation.",
    price: 2400,
    category: "dresses",
    sizes: ["S", "M"],
    stock: 3,
    images: ["https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p4",
    name: "Emerald Pleated Sundress",
    description: "A breezy pleated sundress in striking emerald green. Ideal for luxury resort wear.",
    price: 450,
    category: "dresses",
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    images: ["https://images.unsplash.com/photo-1572804013309-8c98c924bcbe?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p5",
    name: "Obsidian Cutout Gown",
    description: "A sleek black gown featuring daring architectural cutouts and a fitted silhouette.",
    price: 1100,
    category: "dresses",
    sizes: ["XS", "S", "M"],
    stock: 10,
    images: ["https://images.unsplash.com/photo-1583391733958-d25e07facd0f?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p6",
    name: "Blush Chiffon Wrap Dress",
    description: "Soft blush chiffon creates a romantic, flowing silhouette in this versatile wrap dress.",
    price: 550,
    originalPrice: 780,
    discount: 29,
    category: "dresses",
    sizes: ["S", "M", "L"],
    stock: 12,
    newArrival: true,
    images: ["https://images.unsplash.com/photo-1515347619152-1667087ce126?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p7",
    name: "Sapphire Beaded Mini",
    description: "A dazzling mini dress heavily hand-beaded with sapphire crystals.",
    price: 1400,
    category: "dresses",
    sizes: ["XS", "S"],
    stock: 5,
    images: ["https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p8",
    name: "Amber Silk Slip",
    description: "A minimalist bias-cut silk slip dress in a rich amber hue.",
    price: 600,
    category: "dresses",
    sizes: ["S", "M", "L"],
    stock: 18,
    images: ["https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p9",
    name: "Metallic Jacquard Gown",
    description: "A highly structured gown made from custom-milled metallic jacquard fabric.",
    price: 1850,
    category: "dresses",
    sizes: ["S", "M"],
    stock: 4,
    images: ["https://images.unsplash.com/photo-1560457079-9a6532ccb118?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p10",
    name: "White Linen Shirt Dress",
    description: "The ultimate tailored summer staple, crafted from premium Italian linen.",
    price: 350,
    category: "dresses",
    sizes: ["S", "M", "L", "XL"],
    stock: 30,
    images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Category: Tops
  {
    id: "p11",
    name: "Cashmere Turtleneck",
    description: "An ultra-soft Mongolian cashmere sweater with a relaxed turtleneck.",
    price: 450,
    category: "tops",
    sizes: ["S", "M", "L"],
    stock: 20,
    images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p12",
    name: "Silk Charmeuse Blouse",
    description: "A fluid silk blouse featuring delicate pearl buttons and a sharp collar.",
    price: 320,
    category: "tops",
    sizes: ["XS", "S", "M", "L"],
    stock: 15,
    images: ["https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p13",
    name: "Organza Puff Sleeve Top",
    description: "A dramatic evening top with sheer organza puff sleeves.",
    price: 280,
    category: "tops",
    sizes: ["S", "M"],
    stock: 10,
    images: ["https://images.unsplash.com/photo-1550614000-4b95d4ed79fa?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p14",
    name: "Merino Wool Ribbed Knit",
    description: "A body-contouring ribbed top crafted from fine merino wool.",
    price: 220,
    category: "tops",
    sizes: ["S", "M", "L"],
    stock: 25,
    images: ["https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p15",
    name: "Embroidered Cotton Tunic",
    description: "A lightweight cotton tunic with intricate tonal embroidery.",
    price: 190,
    category: "tops",
    sizes: ["M", "L", "XL"],
    stock: 14,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Category: Bottoms
  {
    id: "p16",
    name: "Tailored Wool Trousers",
    description: "High-waisted, wide-leg trousers cut from premium English wool.",
    price: 480,
    category: "bottoms",
    sizes: ["S", "M", "L"],
    stock: 12,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p17",
    name: "Pleated Silk Midi Skirt",
    description: "A fluid silk skirt with sunburst pleats that move beautifully.",
    price: 380,
    category: "bottoms",
    sizes: ["XS", "S", "M"],
    stock: 18,
    images: ["https://images.unsplash.com/photo-1582142407894-ec85a1260a46?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p18",
    name: "Leather Pencil Skirt",
    description: "A sleek pencil skirt crafted from buttery soft Italian nappa leather.",
    price: 750,
    category: "bottoms",
    sizes: ["S", "M"],
    stock: 6,
    images: ["https://images.unsplash.com/photo-1583496661160-c5dcb4c65b16?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p19",
    name: "Crepe Straight-Leg Pants",
    description: "Essential straight-leg pants with a flawless drape.",
    price: 290,
    category: "bottoms",
    sizes: ["S", "M", "L", "XL"],
    stock: 22,
    images: ["https://images.unsplash.com/photo-1604136172384-a1e411fc4100?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p20",
    name: "Denim Flared Jeans",
    description: "Premium Japanese denim with a modern flared silhouette.",
    price: 320,
    category: "bottoms",
    sizes: ["S", "M", "L"],
    stock: 20,
    images: ["https://images.unsplash.com/photo-1542272604-784c46ce5ee5?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Category: Outerwear
  {
    id: "p21",
    name: "Camel Hair Overcoat",
    description: "A luxurious double-breasted overcoat made from 100% camel hair.",
    price: 1600,
    originalPrice: 2200,
    discount: 27,
    category: "outerwear",
    sizes: ["S", "M", "L"],
    stock: 8,
    bestSeller: true,
    images: ["https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p22",
    name: "Classic Trench Coat",
    description: "A timeless gabardine trench coat with tortoiseshell buttons and leather buckles.",
    price: 890,
    category: "outerwear",
    sizes: ["S", "M", "L", "XL"],
    stock: 15,
    images: ["https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p23",
    name: "Leather Moto Jacket",
    description: "A cropped, edgy motorcycle jacket constructed from premium full-grain leather.",
    price: 950,
    category: "outerwear",
    sizes: ["XS", "S", "M"],
    stock: 10,
    images: ["https://images.unsplash.com/photo-1520975954732-57dd22299614?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p24",
    name: "Quilted Silk Bomber",
    description: "An elevated take on the bomber jacket featuring diamond-quilted silk.",
    price: 650,
    category: "outerwear",
    sizes: ["S", "M", "L"],
    stock: 12,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p25",
    name: "Bouclé Tweed Blazer",
    description: "A classic tailored blazer made from rich textured bouclé tweed.",
    price: 780,
    category: "outerwear",
    sizes: ["S", "M", "L"],
    stock: 14,
    images: ["https://images.unsplash.com/photo-1616847201103-68d8745511b8?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },

  // Category: Accessories
  {
    id: "p26",
    name: "Signature Leather Tote",
    description: "A structured, spacious tote bag crafted from smooth calfskin with gold-tone hardware.",
    price: 850,
    originalPrice: 1100,
    discount: 23,
    category: "accessories",
    sizes: ["One Size"],
    stock: 20,
    images: ["https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p27",
    name: "Silk Twill Scarf",
    description: "A 90x90cm silk twill scarf featuring a custom archival floral print.",
    price: 250,
    category: "accessories",
    sizes: ["One Size"],
    stock: 40,
    images: ["https://images.unsplash.com/photo-1606240212003-888e404b901a?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p28",
    name: "Oversized Acetate Sunglasses",
    description: "Glamorous oversized sunglasses crafted from polished tortoiseshell acetate.",
    price: 320,
    category: "accessories",
    sizes: ["One Size"],
    stock: 30,
    images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p29",
    name: "Leather Contour Belt",
    description: "A waist-cinching contour belt featuring a geometric brass buckle.",
    price: 180,
    category: "accessories",
    sizes: ["S", "M", "L"],
    stock: 25,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p30",
    name: "18k Gold Vermeil Hoop Earrings",
    description: "Chunky yet hollow hoop earrings made from 18k gold vermeil over sterling silver.",
    price: 290,
    category: "accessories",
    sizes: ["One Size"],
    stock: 50,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    orderId: "MF-2026-XQW9A",
    customerInfo: {
      firstName: "Eleanor",
      lastName: "Vance",
      email: "eleanor.vance@example.com",
      phone: "+1 555-0198",
      address: "142 Hill House Way",
      city: "Boston",
      state: "MA",
      postalCode: "02108"
    },
    products: [
      { id: "cart_item_1", productId: "p1", name: "Midnight Silk Gown", price: 1200, quantity: 1, size: "S", imageUrl: MOCK_PRODUCTS[0].images[0] },
      { id: "cart_item_2", productId: "p26", name: "Signature Leather Tote", price: 850, quantity: 1, size: "One Size", imageUrl: MOCK_PRODUCTS[25].images[0] }
    ],
    amount: {
      subtotal: 2050,
      shipping: 0, // Free shipping for luxury order
      savings: 0,
      total: 2050
    },
    paymentMethod: "UPI",
    paymentStatus: "verified",
    orderStatus: "processing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1.5).toISOString(),
    processingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    orderId: "MF-2026-B8Z1K",
    customerInfo: {
      firstName: "James",
      lastName: "Holden",
      email: "j.holden@example.com",
      phone: "+1 555-0212",
      address: "1 Rocinante Lane",
      city: "Seattle",
      state: "WA",
      postalCode: "98101"
    },
    products: [
      { id: "cart_item_3", productId: "p21", name: "Camel Hair Overcoat", price: 1600, quantity: 1, size: "L", imageUrl: MOCK_PRODUCTS[20].images[0] }
    ],
    amount: {
      subtotal: 1600,
      shipping: 0,
      savings: 160, // 10% off
      total: 1440
    },
    paymentMethod: "UPI",
    paymentStatus: "pending",
    orderStatus: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    orderId: "MF-2026-LMN4T",
    customerInfo: {
      firstName: "Sarah",
      lastName: "Connor",
      email: "s.connor@example.com",
      phone: "+1 555-9988",
      address: "442 Resistance Blvd",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001"
    },
    products: [
      { id: "cart_item_4", productId: "p23", name: "Leather Moto Jacket", price: 950, quantity: 1, size: "M", imageUrl: MOCK_PRODUCTS[22].images[0] },
      { id: "cart_item_5", productId: "p20", name: "Denim Flared Jeans", price: 320, quantity: 2, size: "M", imageUrl: MOCK_PRODUCTS[19].images[0] }
    ],
    amount: {
      subtotal: 1590,
      shipping: 0,
      savings: 0,
      total: 1590
    },
    paymentMethod: "UPI",
    paymentStatus: "verified",
    orderStatus: "delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6.9).toISOString(),
    processingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6.5).toISOString(),
    shippedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    orderId: "MF-2026-PQR8V",
    customerInfo: {
      firstName: "Arthur",
      lastName: "Dent",
      email: "arthur@example.com",
      phone: "+44 7700 900077",
      address: "42 Prefect Way",
      city: "London",
      state: "UK",
      postalCode: "W1D 1AN"
    },
    products: [
      { id: "cart_item_6", productId: "p11", name: "Cashmere Turtleneck", price: 450, quantity: 1, size: "M", imageUrl: MOCK_PRODUCTS[10].images[0] },
      { id: "cart_item_7", productId: "p27", name: "Silk Twill Scarf", price: 250, quantity: 1, size: "One Size", imageUrl: MOCK_PRODUCTS[26].images[0] }
    ],
    amount: {
      subtotal: 700,
      shipping: 25,
      savings: 0,
      total: 725
    },
    paymentMethod: "UPI",
    paymentStatus: "rejected",
    orderStatus: "cancelled",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    cancelledAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
  },
  {
    orderId: "MF-2026-VBN2M",
    customerInfo: {
      firstName: "Diana",
      lastName: "Prince",
      email: "diana.prince@example.com",
      phone: "+1 555-7777",
      address: "1 Themyscira Ave",
      city: "Washington",
      state: "DC",
      postalCode: "20001"
    },
    products: [
      { id: "cart_item_8", productId: "p9", name: "Metallic Jacquard Gown", price: 1850, quantity: 1, size: "S", imageUrl: MOCK_PRODUCTS[8].images[0] },
      { id: "cart_item_9", productId: "p30", name: "18k Gold Vermeil Hoop Earrings", price: 290, quantity: 1, size: "One Size", imageUrl: MOCK_PRODUCTS[29].images[0] }
    ],
    amount: {
      subtotal: 2140,
      shipping: 0,
      savings: 0,
      total: 2140
    },
    paymentMethod: "UPI",
    paymentStatus: "verified",
    orderStatus: "shipped",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    verifiedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3.8).toISOString(),
    processingAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3.5).toISOString(),
    shippedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  }
];
