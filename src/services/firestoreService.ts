import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';

export interface StoreItem {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  status: 'Open' | 'Closed' | 'Busy';
  isBusyMode: boolean;
  estimatedPreparationTime: number;
  distance: string;
  image: string;
  productCount: number;
  reliabilityScore: number;
}

export interface CatalogProduct {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  stock: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  rating: number;
  image: string;
  deliveryTime: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CustomerOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  storeId: string;
  storeName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status:
    | 'Order Placed'
    | 'Retailer Accepted'
    | 'Preparing Order'
    | 'Ready for Pickup'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancelled'
    | 'Delayed';
  paymentMethod: 'UPI Demo' | 'Cash on Delivery' | 'Card Demo';
  deliveryAddress: string;
  estimatedArrival: string;
  delayMinutes?: number;
  rejectionReason?: string;
  createdAt: string;
}

// Initial Sample Stores in Hyderabad
export const INITIAL_STORES: StoreItem[] = [
  {
    id: 'store-1',
    name: 'Balaji Provision & Supermarket',
    category: 'Groceries',
    location: 'Madhapur, Hyderabad',
    rating: 4.8,
    status: 'Open',
    isBusyMode: false,
    estimatedPreparationTime: 12,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
    productCount: 142,
    reliabilityScore: 88,
  },
  {
    id: 'store-2',
    name: 'Apollo 24/7 Neighborhood Pharmacy',
    category: 'Pharmacy',
    location: 'Kukatpally, Hyderabad',
    rating: 4.9,
    status: 'Open',
    isBusyMode: false,
    estimatedPreparationTime: 8,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=500&auto=format&fit=crop&q=80',
    productCount: 89,
    reliabilityScore: 94,
  },
  {
    id: 'store-3',
    name: 'Karachi Bakery & Confectionery',
    category: 'Bakery',
    location: 'Gachibowli, Hyderabad',
    rating: 4.7,
    status: 'Open',
    isBusyMode: false,
    estimatedPreparationTime: 15,
    distance: '1.5 km',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    productCount: 64,
    reliabilityScore: 82,
  },
  {
    id: 'store-4',
    name: 'National Stationery & Art Emporium',
    category: 'Stationery',
    location: 'Kondapur, Hyderabad',
    rating: 4.6,
    status: 'Open',
    isBusyMode: false,
    estimatedPreparationTime: 10,
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80',
    productCount: 110,
    reliabilityScore: 91,
  },
  {
    id: 'store-5',
    name: 'Sri Krishna Dairy & Organic Produce',
    category: 'Dairy',
    location: 'Miyapur, Hyderabad',
    rating: 4.8,
    status: 'Open',
    isBusyMode: false,
    estimatedPreparationTime: 10,
    distance: '1.1 km',
    image: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=500&auto=format&fit=crop&q=80',
    productCount: 48,
    reliabilityScore: 86,
  },
];

// Initial Sample Products
export const INITIAL_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    storeName: 'Balaji Provision & Supermarket',
    name: 'Aashirvaad Shudh Chakki Atta (5kg)',
    category: 'Groceries',
    price: 245,
    originalPrice: 280,
    stock: 24,
    stockStatus: 'In Stock',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '15-20 min',
    description: '100% pure whole wheat flour processed with traditional stone chakki grinding.',
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    storeName: 'Balaji Provision & Supermarket',
    name: 'Fortune Sunlite Refined Sunflower Oil (1L)',
    category: 'Groceries',
    price: 135,
    originalPrice: 155,
    stock: 18,
    stockStatus: 'In Stock',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '15-20 min',
    description: 'Light, healthy cooking oil enriched with vitamins A & D for daily cooking.',
  },
  {
    id: 'prod-3',
    storeId: 'store-1',
    storeName: 'Balaji Provision & Supermarket',
    name: 'Tata Salt Vacuum Evaporated Iodised (1kg)',
    category: 'Groceries',
    price: 28,
    originalPrice: 30,
    stock: 45,
    stockStatus: 'In Stock',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '15-20 min',
    description: 'India’s trusted vacuum-evaporated iodised salt for mental and physical development.',
  },
  {
    id: 'prod-4',
    storeId: 'store-5',
    storeName: 'Sri Krishna Dairy & Organic Produce',
    name: 'Amul Taaza Homogenised Toned Milk (1L)',
    category: 'Dairy',
    price: 54,
    originalPrice: 56,
    stock: 35,
    stockStatus: 'In Stock',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '10-15 min',
    description: 'Pasteurised fresh toned milk, rich in calcium and protein.',
  },
  {
    id: 'prod-5',
    storeId: 'store-3',
    storeName: 'Karachi Bakery & Confectionery',
    name: 'Britannia 100% Whole Wheat Bread (400g)',
    category: 'Bakery',
    price: 45,
    originalPrice: 50,
    stock: 2,
    stockStatus: 'Low Stock',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '15-25 min',
    description: 'Freshly baked wholesome brown bread made with 100% whole wheat grains.',
  },
  {
    id: 'prod-6',
    storeId: 'store-5',
    storeName: 'Sri Krishna Dairy & Organic Produce',
    name: 'Fresh Robusta Golden Bananas (1 Dozen)',
    category: 'Fruits & Vegetables',
    price: 60,
    originalPrice: 75,
    stock: 0,
    stockStatus: 'Out of Stock', // Used to test Substitution Engine
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '15-20 min',
    description: 'Naturally ripened, farm-fresh sweet robusta bananas rich in potassium.',
  },
  {
    id: 'prod-7',
    storeId: 'store-2',
    storeName: 'Apollo 24/7 Neighborhood Pharmacy',
    name: 'First Aid Emergency & Dressing Kit',
    category: 'Pharmacy',
    price: 185,
    originalPrice: 220,
    stock: 12,
    stockStatus: 'In Stock',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '10-15 min',
    description: 'Complete family antiseptic liquid, sterile bandages, and medical tape pack.',
  },
  {
    id: 'prod-8',
    storeId: 'store-4',
    storeName: 'National Stationery & Art Emporium',
    name: 'Classmate Spiral Premium Notebook Set (Pack of 4)',
    category: 'Stationery',
    price: 260,
    originalPrice: 320,
    stock: 16,
    stockStatus: 'In Stock',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500&auto=format&fit=crop&q=80',
    deliveryTime: '15-25 min',
    description: 'Smooth 70 GSM ruled pages with sturdy hardcover binding for students and work.',
  },
];

// Initial Connected Orders
export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: 'NC-HYD-9041',
    customerId: 'cust-demo-1',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98490 12345',
    storeId: 'store-1',
    storeName: 'Balaji Provision & Supermarket',
    items: [
      {
        productId: 'prod-1',
        name: 'Aashirvaad Shudh Chakki Atta (5kg)',
        price: 245,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      },
      {
        productId: 'prod-4',
        name: 'Amul Taaza Homogenised Toned Milk (1L)',
        price: 54,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 353,
    deliveryFee: 25,
    discount: 30,
    total: 348,
    status: 'Out for Delivery',
    paymentMethod: 'UPI Demo',
    deliveryAddress: 'Flat 402, Sai Residency, Madhapur, Hyderabad - 500081',
    estimatedArrival: '12 mins (Arriving ~3:45 PM)',
    delayMinutes: 0,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'NC-HYD-9038',
    customerId: 'cust-demo-2',
    customerName: 'Rahul Verma',
    customerPhone: '+91 97000 67890',
    storeId: 'store-3',
    storeName: 'Karachi Bakery & Confectionery',
    items: [
      {
        productId: 'prod-5',
        name: 'Britannia 100% Whole Wheat Bread (400g)',
        price: 45,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 90,
    deliveryFee: 20,
    discount: 0,
    total: 110,
    status: 'Delayed',
    paymentMethod: 'Cash on Delivery',
    deliveryAddress: 'Plot 18, Silicon Valley, Gachibowli, Hyderabad - 500032',
    estimatedArrival: 'Delayed by 18 mins (Heavy rain at junction)',
    delayMinutes: 18,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'NC-HYD-9032',
    customerId: 'cust-demo-3',
    customerName: 'Ananya Reddy',
    customerPhone: '+91 99890 54321',
    storeId: 'store-2',
    storeName: 'Apollo 24/7 Neighborhood Pharmacy',
    items: [
      {
        productId: 'prod-7',
        name: 'First Aid Emergency & Dressing Kit',
        price: 185,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 185,
    deliveryFee: 15,
    discount: 20,
    total: 180,
    status: 'Delivered',
    paymentMethod: 'Card Demo',
    deliveryAddress: 'House 54, Phase 3, Kukatpally, Hyderabad - 500072',
    estimatedArrival: 'Delivered at 2:30 PM',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

// Helper to save order to Firestore & local storage
export async function createOrderInFirestore(order: CustomerOrder): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, order);
  } catch (err) {
    console.warn('Could not write order to Firestore, fallback to local cache:', err);
  }
}

// Helper to update order status across ecosystem
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: CustomerOrder['status'],
  extras?: { delayMinutes?: number; rejectionReason?: string; estimatedArrival?: string }
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      ...(extras || {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not update order in Firestore, falling back to local state:', err);
  }
}

// Helper to update product stock in Firestore
export async function updateProductStockInFirestore(
  productId: string,
  newStock: number,
  stockStatus: CatalogProduct['stockStatus']
): Promise<void> {
  try {
    const prodRef = doc(db, 'products', productId);
    await updateDoc(prodRef, {
      stock: newStock,
      stockStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not update product in Firestore, local cache used:', err);
  }
}

// Helper to toggle Busy Store Mode in Firestore
export async function toggleStoreBusyModeInFirestore(storeId: string, isBusy: boolean): Promise<void> {
  try {
    const storeRef = doc(db, 'stores', storeId);
    await updateDoc(storeRef, {
      isBusyMode: isBusy,
      status: isBusy ? 'Busy' : 'Open',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not update store in Firestore, local cache used:', err);
  }
}
