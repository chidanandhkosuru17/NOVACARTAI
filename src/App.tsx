import React, { useState, useEffect } from 'react';
import { AuthProvider } from './firebase/authContext';
import { Navbar, UserEnvironment } from './components/Navbar';
import { Sidebar, TabKey } from './components/Sidebar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { CustomerIntelligence } from './components/CustomerIntelligence';
import { SmartInventory } from './components/SmartInventory';
import { OrderRescue } from './components/OrderRescue';
import { SmartPromotions } from './components/SmartPromotions';
import { SupportTickets } from './components/SupportTickets';
import { BusinessSimulator } from './components/BusinessSimulator';
import { ActionPlanAndBudget } from './components/ActionPlanAndBudget';
import { RecommendationEngine } from './components/RecommendationEngine';
import { ImpactReportModal } from './components/ImpactReportModal';
import { CompetitionTourModal } from './components/CompetitionTourModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { StoreRadarMaps } from './components/StoreRadarMaps';
import { MarketTrendsSearch } from './components/MarketTrendsSearch';
import { PromoVideoStudio } from './components/PromoVideoStudio';
import { CustomerApp } from './components/customer/CustomerApp';
import { RetailerPortal } from './components/retailer/RetailerPortal';

import {
  INITIAL_METRICS,
  INITIAL_SEGMENTS,
  INITIAL_INVENTORY,
  INITIAL_ORDERS as INITIAL_ADMIN_ORDERS,
  INITIAL_CAMPAIGNS,
  INITIAL_TICKETS,
  INITIAL_BUDGET,
  INITIAL_RECOMMENDATIONS,
} from './data/seedData';
import {
  BaselineMetrics,
  CustomerSegment,
  InventoryItem,
  OperationalOrder,
  Campaign,
  SupportTicket,
  BudgetInitiative,
  BusinessRecommendation,
  SimulationResults,
} from './types';
import {
  StoreItem,
  CatalogProduct,
  CustomerOrder,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS as INITIAL_CUSTOMER_ORDERS,
  createOrderInFirestore,
  updateOrderStatusInFirestore,
  updateProductStockInFirestore,
  toggleStoreBusyModeInFirestore,
} from './services/firestoreService';

function MainApp() {
  // 3-Way Connected Environment (Customer Shopping vs Retailer Portal vs Admin Command Center)
  const [currentEnvironment, setCurrentEnvironment] = useState<UserEnvironment>('customer');
  const [currentTab, setCurrentTab] = useState<TabKey>('executive');
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Connected Database / Local Persistence State
  const [stores, setStores] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('novacart_stores');
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    const saved = localStorage.getItem('novacart_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    const saved = localStorage.getItem('novacart_customer_orders');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_ORDERS;
  });

  // Admin Ecosystem State
  const [metrics, setMetrics] = useState<BaselineMetrics>(() => {
    const saved = localStorage.getItem('novacart_metrics');
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });

  const [segments, setSegments] = useState<CustomerSegment[]>(INITIAL_SEGMENTS);

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('novacart_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [adminOrders, setAdminOrders] = useState<OperationalOrder[]>(() => {
    const saved = localStorage.getItem('novacart_admin_orders');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_ORDERS;
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('novacart_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('novacart_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [initiatives, setInitiatives] = useState<BudgetInitiative[]>(() => {
    const saved = localStorage.getItem('novacart_initiatives');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET;
  });

  const [recommendations, setRecommendations] = useState<BusinessRecommendation[]>(INITIAL_RECOMMENDATIONS);

  const [campaignPrefill, setCampaignPrefill] = useState<{
    segment: string;
    discount: number;
  } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('novacart_stores', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('novacart_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('novacart_customer_orders', JSON.stringify(customerOrders));
  }, [customerOrders]);

  useEffect(() => {
    localStorage.setItem('novacart_metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('novacart_admin_orders', JSON.stringify(adminOrders));
  }, [adminOrders]);

  useEffect(() => {
    localStorage.setItem('novacart_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('novacart_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Connected Workflows: When Customer Places an Order
  const handlePlaceCustomerOrder = (newOrder: CustomerOrder) => {
    setCustomerOrders((prev) => [newOrder, ...prev]);
    createOrderInFirestore(newOrder);

    // Update catalog stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = newOrder.items.find((i) => i.productId === p.id);
        if (item) {
          const nextStock = Math.max(0, p.stock - item.quantity);
          const nextStatus = nextStock === 0 ? 'Out of Stock' : nextStock <= 5 ? 'Low Stock' : 'In Stock';
          updateProductStockInFirestore(p.id, nextStock, nextStatus);
          return { ...p, stock: nextStock, stockStatus: nextStatus };
        }
        return p;
      })
    );

    // Add to Admin Order Rescue queue
    const newAdminOrder: OperationalOrder = {
      id: newOrder.id,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone || '+91 98490 12345',
      retailerName: newOrder.storeName,
      category: 'Grocery',
      city: 'Bengaluru',
      locality: 'Madhapur, Hyderabad',
      orderValue: newOrder.total,
      orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedMinutes: 25,
      status: 'Placed',
      delayStatus: 'On Time',
      riskLevel: 'Normal',
      isRescued: false,
    };
    setAdminOrders((prev) => [newAdminOrder, ...prev]);

    // Update Platform Metrics
    setMetrics((prev) => ({
      ...prev,
      monthlyOrders: prev.monthlyOrders + 1,
      monthlyRevenue: prev.monthlyRevenue + newOrder.total,
    }));
  };

  // Connected Workflows: When Retailer Updates Order Status
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: CustomerOrder['status'],
    extras?: { rejectionReason?: string; delayMinutes?: number; estimatedArrival?: string }
  ) => {
    setCustomerOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, ...(extras || {}) } : o))
    );
    updateOrderStatusInFirestore(orderId, newStatus, extras);

    // Sync to admin orders
    setAdminOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status:
              newStatus === 'Delivered'
                ? 'Delivered'
                : newStatus === 'Cancelled'
                ? 'Cancelled'
                : newStatus === 'Preparing Order'
                ? 'Preparing'
                : newStatus === 'Out for Delivery'
                ? 'Out for delivery'
                : 'Confirmed',
            riskLevel: newStatus === 'Cancelled' ? 'Critical' : newStatus === 'Delayed' ? 'High' : 'Normal',
            delayStatus: newStatus === 'Delayed' ? 'Critical Delay (+15m)' : 'On Time',
          };
        }
        return o;
      })
    );

    if (newStatus === 'Cancelled') {
      setMetrics((m) => ({ ...m, cancellationRate: Math.min(100, +(m.cancellationRate + 0.1).toFixed(1)) }));
    }
  };

  // Connected Workflows: When Retailer Updates Product Stock
  const handleUpdateProductStock = (productId: string, newStock: number) => {
    const nextStatus = newStock === 0 ? 'Out of Stock' : newStock <= 5 ? 'Low Stock' : 'In Stock';
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock, stockStatus: nextStatus } : p))
    );
    updateProductStockInFirestore(productId, newStock, nextStatus);
  };

  // Connected Workflows: When Retailer Toggles Busy Store Mode
  const handleToggleStoreBusyMode = (storeId: string, isBusy: boolean) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isBusyMode: isBusy, status: isBusy ? 'Busy' : 'Open' } : s))
    );
    toggleStoreBusyModeInFirestore(storeId, isBusy);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    localStorage.clear();
    setStores(INITIAL_STORES);
    setProducts(INITIAL_PRODUCTS);
    setCustomerOrders(INITIAL_CUSTOMER_ORDERS);
    setMetrics(INITIAL_METRICS);
    setSegments(INITIAL_SEGMENTS);
    setInventory(INITIAL_INVENTORY);
    setAdminOrders(INITIAL_ADMIN_ORDERS);
    setCampaigns(INITIAL_CAMPAIGNS);
    setTickets(INITIAL_TICKETS);
    setInitiatives(INITIAL_BUDGET);
    setRecommendations(INITIAL_RECOMMENDATIONS);
    setCurrentEnvironment('customer');
    setCurrentTab('executive');
  };

  const openOrdersAtRisk = adminOrders.filter(
    (o) => (o.riskLevel === 'Critical' || o.riskLevel === 'High') && !o.isRescued
  ).length;

  const openTicketsCount = tickets.filter(
    (t) => t.status === 'Open' || t.status === 'In Progress'
  ).length;

  const lowStockItemsCount = products.filter(
    (p) => p.stock <= 5 || p.stockStatus === 'Low Stock' || p.stockStatus === 'Out of Stock'
  ).length;

  return (
    <div className="min-h-screen bg-[#080D1D] text-[#F8FAFC] flex flex-col font-sans antialiased selection:bg-[#22D3EE] selection:text-slate-950 relative">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.14),rgba(255,255,255,0))]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_60%_at_90%_40%,rgba(34,211,238,0.08),rgba(255,255,255,0))]" />

      {/* Top Navbar */}
      <Navbar
        onOpenTour={() => setIsTourOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        monthlyRevenue={metrics.monthlyRevenue}
        repeatRate={metrics.repeatPurchaseRate}
        cancellationRate={metrics.cancellationRate}
        deliveryTime={metrics.averageDeliveryTime}
        supportTickets={metrics.monthlySupportTickets}
        unusedCouponRate={metrics.unusedCouponRate}
        onNavigateTab={(tab) => {
          setCurrentEnvironment('admin');
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentEnvironment={currentEnvironment}
        onSwitchEnvironment={(env) => setCurrentEnvironment(env)}
      />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden relative z-10">
        {/* Render Customer Application */}
        {currentEnvironment === 'customer' && (
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8">
            <CustomerApp
              stores={stores}
              products={products}
              orders={customerOrders}
              onPlaceOrder={handlePlaceCustomerOrder}
              onUpdateProductStock={handleUpdateProductStock}
            />
          </main>
        )}

        {/* Render Retailer Management Portal */}
        {currentEnvironment === 'retailer' && (
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8">
            <RetailerPortal
              stores={stores}
              products={products}
              orders={customerOrders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onUpdateProductStock={handleUpdateProductStock}
              onToggleBusyMode={handleToggleStoreBusyMode}
            />
          </main>
        )}

        {/* Render Admin Command Center */}
        {currentEnvironment === 'admin' && (
          <>
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              openOrdersAtRisk={openOrdersAtRisk}
              openTickets={openTicketsCount}
              lowStockItemsCount={lowStockItemsCount}
            />

            <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8">
              {currentTab === 'executive' && (
                <ExecutiveDashboard
                  metrics={metrics}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'customer_intelligence' && (
                <CustomerIntelligence
                  segments={segments}
                  onLaunchCampaignForSegment={(segment, discount) => {
                    setCampaignPrefill({ segment, discount });
                    setCurrentTab('promotions');
                  }}
                />
              )}

              {currentTab === 'inventory' && (
                <SmartInventory
                  inventory={inventory}
                  onUpdateInventory={(updated) => setInventory(updated)}
                />
              )}

              {currentTab === 'order_rescue' && (
                <OrderRescue
                  orders={adminOrders}
                  onUpdateOrders={(updated) => setAdminOrders(updated)}
                />
              )}

              {currentTab === 'promotions' && (
                <SmartPromotions
                  campaigns={campaigns}
                  onUpdateCampaigns={(updated) => setCampaigns(updated)}
                  prefillSegment={campaignPrefill?.segment}
                  prefillDiscount={campaignPrefill?.discount}
                />
              )}

              {currentTab === 'support' && (
                <SupportTickets
                  tickets={tickets}
                  onUpdateTickets={(updated) => setTickets(updated)}
                />
              )}

              {currentTab === 'simulator' && (
                <BusinessSimulator
                  baselineMetrics={INITIAL_METRICS}
                  onSimulationRun={(res) => {
                    setMetrics((prev) => ({
                      ...prev,
                      monthlyRevenue: res.projectedMonthlyRevenue,
                      monthlyOrders: res.projectedMonthlyOrders,
                    }));
                  }}
                />
              )}

              {currentTab === 'action_plan' && (
                <ActionPlanAndBudget
                  initiatives={initiatives}
                  onUpdateInitiatives={(updated) => setInitiatives(updated)}
                />
              )}

              {currentTab === 'recommendations' && (
                <RecommendationEngine
                  recommendations={recommendations}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                />
              )}

              {/* Maps Grounding */}
              {currentTab === 'store_radar' && <StoreRadarMaps />}

              {/* Search Grounding */}
              {currentTab === 'market_trends' && <MarketTrendsSearch />}

              {/* Veo Video Generation */}
              {currentTab === 'promo_studio' && <PromoVideoStudio />}
            </main>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar for Admin */}
      {currentEnvironment === 'admin' && (
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDrawer={() => setIsMobileDrawerOpen(true)}
          openOrdersAtRisk={openOrdersAtRisk}
          lowStockCount={lowStockItemsCount}
          openTickets={openTicketsCount}
        />
      )}

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileDrawerOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenTour={() => {
          setIsMobileDrawerOpen(false);
          setIsTourOpen(true);
        }}
        onOpenReport={() => {
          setIsMobileDrawerOpen(false);
          setIsReportOpen(true);
        }}
        openTickets={openTicketsCount}
        monthlyRevenue={metrics.monthlyRevenue}
        repeatRate={metrics.repeatPurchaseRate}
        cancellationRate={metrics.cancellationRate}
        deliveryTime={metrics.averageDeliveryTime}
      />

      {/* Presentation Mode / 10-Step Competition Tour Modal */}
      <CompetitionTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSwitchRole={(role) => setCurrentEnvironment(role)}
        onSelectTab={(tab) => {
          setCurrentEnvironment('admin');
          setCurrentTab(tab);
        }}
        onResetDemoData={handleResetDemoData}
        onOpenReport={() => {
          setIsTourOpen(false);
          setIsReportOpen(true);
        }}
      />

      {/* Executive Impact Report Modal */}
      <ImpactReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        metrics={metrics}
        initiatives={initiatives}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
