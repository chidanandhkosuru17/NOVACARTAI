export interface Store {
  id: string;
  name: string;
  category: RetailerCategory;
  city: City | 'Hyderabad';
  locality: string;
  rating: number;
  deliveryTimeMinutes: number;
  distanceKm: number;
  image: string;
  isOpen: boolean;
  isBusy: boolean;
  productsCount: number;
  address: string;
  inventoryHealthScore: number;
}

export interface StoreProduct {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discountPct: number;
  stock: number;
  isAvailable: boolean;
  rating: number;
  image: string;
  description: string;
  unit: string;
  estimatedDeliveryMins: number;
  sku: string;
  lastUpdated: string;
  substitutionAlternative?: {
    storeName: string;
    productName: string;
    price: number;
    distanceKm: number;
  };
}

export interface CartItem {
  id: string;
  product: StoreProduct;
  quantity: number;
}

export type CustomerOrderStatus =
  | 'Order Placed'
  | 'Retailer Accepted'
  | 'Preparing Order'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  locality: string;
  storeId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: CustomerOrderStatus;
  createdAt: string;
  estimatedArrival: string;
  paymentMethod: 'UPI Demo' | 'Cash on Delivery' | 'Card Demo';
  isDelayed?: boolean;
  delayNotice?: string;
  rejectionReason?: string;
}

export interface LoyaltyPointRecord {
  id: string;
  date: string;
  description: string;
  points: number;
  type: 'earned' | 'redeemed';
}

export interface BaselineMetrics {
  totalUsers: number;
  monthlyActiveUsers: number;
  monthlyOrders: number;
  monthlyRevenue: number; // in INR (e.g. 2610000 = ₹26.1 lakh)
  averageOrderValue: number; // ₹486
  repeatPurchaseRate: number; // 27% (declined from 41%)
  priorRepeatPurchaseRate: number; // 41%
  cancellationRate: number; // 11% (increased from 6%)
  priorCancellationRate: number; // 6%
  averageDeliveryTime: number; // 37 min (increased from 29)
  priorDeliveryTime: number; // 29 min
  marketingSpend: number; // ₹17,00,000 (17 lakh)
  acquisitionShare: number; // 58%
  unusedCouponRate: number; // 44%
  monthlySupportTickets: number; // 5,900 (increased from 3,100)
  priorSupportTickets: number; // 3,100
  averageResolutionHours: number; // 9.2 hrs
  activeRetailers: number; // ~620
  citiesCount: number; // 3
}

export type City = 'Bengaluru' | 'Mumbai' | 'Delhi NCR';

export type RetailerCategory =
  | 'Grocery'
  | 'Pharmacy'
  | 'Bakery'
  | 'Stationery'
  | 'Neighborhood Mart';

export interface CustomerSegment {
  id: string;
  name: string;
  customerCount: number;
  orderFrequency: number; // orders / month
  averageOrderValue: number;
  repeatPurchaseRate: number;
  estimatedCustomerValue: number; // LTV
  retentionStatus: 'Critical' | 'Declining' | 'Stable' | 'High Potential' | 'Champion';
  behaviorDescription: string;
  recommendedActions: string[];
}

export interface InventoryItem {
  id: string;
  storeName: string;
  city: City;
  category: RetailerCategory;
  productName: string;
  availableStock: number;
  unit: string;
  price: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Stale Inventory';
  lastUpdated: string;
  productAvailability: boolean;
  orderDemand: 'Low' | 'Medium' | 'High' | 'Surge';
  mismatchRisk: boolean;
  mismatchReason?: string;
}

export type OrderStatus =
  | 'Placed'
  | 'Confirmed'
  | 'Preparing'
  | 'Picked up'
  | 'Out for delivery'
  | 'Delivered'
  | 'Cancelled';

export type RiskLevel = 'Normal' | 'Medium' | 'High' | 'Critical';

export interface OperationalOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  retailerName: string;
  category: RetailerCategory;
  city: City;
  locality: string;
  orderValue: number;
  status: OrderStatus;
  estimatedMinutes: number;
  actualMinutes?: number;
  orderTime: string;
  delayStatus: 'On Time' | 'Minor Delay (+5m)' | 'Critical Delay (+15m)' | 'Severely Delayed';
  riskLevel: RiskLevel;
  riskReason?: string;
  cancellationReason?: string;
  suggestedAction?: string;
  isRescued?: boolean;
  rescueActionNote?: string;
}

export interface Campaign {
  id: string;
  name: string;
  type:
    | 'First-order offer'
    | 'Repeat purchase reward'
    | 'Lapsed customer reactivation'
    | 'Category-based promotion'
    | 'Nearby retailer promotion'
    | 'Referral campaign';
  targetSegment: string;
  budget: number; // INR
  discountPct: number;
  status: 'Active' | 'Paused' | 'Draft' | 'Completed';
  ordersGenerated: number;
  revenueGenerated: number;
  redemptionRate: number; // %
  estimatedRoi: number; // e.g. 2.4x
}

export interface SupportTicket {
  id: string;
  customerName: string;
  orderId: string;
  category: 'Refund' | 'Delivery delay' | 'Missing product' | 'Coupon issue' | 'Incorrect order' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  timeAgo: string;
  assignedAgent: string;
  resolutionNotes?: string;
  createdAt: string;
  description: string;
}

export interface BudgetInitiative {
  key: string;
  name: string;
  category: string;
  allocationLakh: number;
  recommendedLakh: number;
  description: string;
  kpisImpacted: string[];
}

export interface SimulationParameters {
  targetRepeatRate: number; // 27% baseline
  targetCancellationRate: number; // 11% baseline
  targetDeliveryMinutes: number; // 37 min baseline
  targetInventoryAccuracy: number; // 74% baseline
  targetSupportResolutionHours: number; // 9.2 hrs baseline
  retentionMarketingShare: number; // 42% baseline
  averageOrderValue: number; // ₹486 baseline
}

export interface SimulationResults {
  projectedMonthlyOrders: number;
  projectedMonthlyRevenue: number; // in INR
  projectedMonthlyCancelledAvoided: number;
  projectedRepeatCustomersMonthly: number;
  projectedNetProfitDeltaLakh: number;
  budgetSpentLakh: number;
  budgetRemainingLakh: number;
  sixMonthTurnaroundValueINR: number;
}

export interface BusinessRecommendation {
  id: string;
  detectedIssue: string;
  supportingMetric: string;
  suggestedAction: string;
  expectedImpact: string;
  priority: 'High' | 'Medium' | 'Critical';
  reason: string;
  category: 'Retention' | 'Operations' | 'Inventory' | 'Marketing' | 'Support';
}
