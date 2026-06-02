export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  collection?: string; // Legacy tag for lookbooks
  collections?: string[]; // Array of tags for lookbooks
  sizes: string[];
  stock: number;
  images: string[];
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  discount?: number;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  size: string;
  quantity: number;
  weight?: number;
  imageUrl: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'customer' | 'admin';
  createdAt: string;
}
export interface Order {
  orderId: string;
  customerInfo: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  products: CartItem[];
  appliedCoupon?: string | null;
  amount: {
    subtotal: number;
    shipping: number;
    couponDiscount: number;
    total: number;
    savings: number;
  };
  paymentScreenshot?: string;
  paymentMethod?: 'UPI' | 'Card' | 'COD';
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  verifiedAt?: any; // any to allow serverTimestamp() initially, then string on fetch
  processingAt?: any;
  shippedAt?: any;
  deliveredAt?: any;
  cancelledAt?: any;
}

export interface Offer {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: number;
  bannerImage: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
  priority: number;
  productIds?: string[];   // products hand-picked for this campaign
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrendingCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  mainImage: string;
  textureImage?: string;
  productIds: string[];
}

export interface TrendingSettings {
  sectionTitle: string;
  sectionSubtitle: string;
  sectionDescription: string;
  cards: TrendingCard[];
}

export interface Category {
  id: string;
  title: string;
  items: string; // e.g. "120+ items"
  image: string;
  link: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  minOrderValue?: number;
  createdAt: string;
  updatedAt: string;
}
