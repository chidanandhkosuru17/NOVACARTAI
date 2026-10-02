import React, { useState, useMemo } from 'react';
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  ShieldCheck,
  ChevronRight,
  Flame,
  Power,
  Sliders,
} from 'lucide-react';
import {
  StoreItem,
  CatalogProduct,
  CustomerOrder,
} from '../../services/firestoreService';
import { formatINR } from '../../utils/formatters';

interface RetailerPortalProps {
  stores: StoreItem[];
  products: CatalogProduct[];
  orders: CustomerOrder[];
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: CustomerOrder['status'],
    extras?: { rejectionReason?: string; delayMinutes?: number; estimatedArrival?: string }
  ) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onToggleBusyMode: (storeId: string, isBusy: boolean) => void;
}

export const RetailerPortal: React.FC<RetailerPortalProps> = ({
  stores,
  products,
  orders,
  onUpdateOrderStatus,
  onUpdateProductStock,
  onToggleBusyMode,
}) => {
  // Current active retailer store (default to Balaji Provision Store)
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1');
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'analytics'>('overview');

  // Rejection Dialog State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Out of stock at store shelf');

  // Stock edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<number>(0);

  // Search & filter
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  const currentStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0];
  }, [stores, selectedStoreId]);

  // Orders for this store
  const storeOrders = useMemo(() => {
    return orders.filter((o) => o.storeId === currentStore.id);
  }, [orders, currentStore.id]);

  // Products for this store
  const storeProducts = useMemo(() => {
    return products.filter((p) => p.storeId === currentStore.id);
  }, [products, currentStore.id]);

  const filteredStoreProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      const matchesSearch =
        !inventorySearch ||
        p.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        p.category.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesLowStock = !lowStockOnly || p.stock <= 5;
      return matchesSearch && matchesLowStock;
    });
  }, [storeProducts, inventorySearch, lowStockOnly]);

  // Store KPIs
  const todaySales = useMemo(() => {
    return storeOrders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.total : sum), 0);
  }, [storeOrders]);

  const pendingCount = storeOrders.filter((o) => o.status === 'Order Placed' || o.status === 'Retailer Accepted').length;
  const completedCount = storeOrders.filter((o) => o.status === 'Delivered').length;

  // Handle Order Accept / Advance
  const handleAdvanceOrderStatus = (order: CustomerOrder) => {
    if (order.status === 'Order Placed') {
      onUpdateOrderStatus(order.id, 'Retailer Accepted');
    } else if (order.status === 'Retailer Accepted') {
      onUpdateOrderStatus(order.id, 'Preparing Order');
    } else if (order.status === 'Preparing Order') {
      onUpdateOrderStatus(order.id, 'Ready for Pickup');
    } else if (order.status === 'Ready for Pickup') {
      onUpdateOrderStatus(order.id, 'Out for Delivery');
    } else if (order.status === 'Out for Delivery') {
      onUpdateOrderStatus(order.id, 'Delivered');
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectingOrderId) return;
    onUpdateOrderStatus(rejectingOrderId, 'Cancelled', {
      rejectionReason,
    });
    setRejectingOrderId(null);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner: Store Selector & Busy Store Mode */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <img
              src={currentStore.image}
              alt={currentStore.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-700 flex-shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-sm font-black text-white px-3 py-1 rounded-xl cursor-pointer"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  RETAILER PARTNER
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                NOVA CART Local Merchant Dashboard • Hyderabad Cluster Dispatch
              </p>
            </div>
          </div>

          {/* Busy Store Mode Toggle & Navigation Tabs */}
          <div className="flex items-center space-x-3">
            {/* Busy Store Mode Switch */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">Busy Store Mode</span>
              <button
                type="button"
                onClick={() => onToggleBusyMode(currentStore.id, !currentStore.isBusyMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                  currentStore.isBusyMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                    currentStore.isBusyMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
              {(['overview', 'orders', 'inventory', 'analytics'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Busy Store Notification */}
      {currentStore.isBusyMode && (
        <div className="p-4 rounded-3xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Busy Store Mode Active:</strong> Customer-facing preparation estimates increased by +20 minutes. Orders are being accepted with surge prioritization.
            </span>
          </div>
          <button
            onClick={() => onToggleBusyMode(currentStore.id, false)}
            className="text-xs font-bold text-white underline hover:no-underline"
          >
            Turn Off Busy Mode
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Today's Sales</span>
              <p className="text-xl font-black text-emerald-400 font-mono">{formatINR(todaySales)}</p>
              <span className="text-[10px] text-emerald-400 font-semibold">+14.2% vs yesterday</span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pending Orders</span>
              <p className="text-xl font-black text-amber-400 font-mono">{pendingCount}</p>
              <span className="text-[10px] text-slate-400 font-medium">Requires fulfillment</span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Completed Orders</span>
              <p className="text-xl font-black text-indigo-400 font-mono">{completedCount}</p>
              <span className="text-[10px] text-indigo-400 font-semibold">100% dispatch rate</span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Inventory Reliability</span>
              <p className="text-xl font-black text-cyan-400 font-mono">{currentStore.reliabilityScore}%</p>
              <span className="text-[10px] text-cyan-400 font-semibold">Healthy stock sync</span>
            </div>
          </div>

          {/* Quick Active Orders Section */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Incoming Store Orders</h3>
              </div>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                View All Orders ({storeOrders.length}) →
              </button>
            </div>

            {storeOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No orders for this store right now. Place an order from the Customer App!
              </div>
            ) : (
              <div className="space-y-3">
                {storeOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-black text-white">{order.id}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Customer: <strong className="text-white">{order.customerName}</strong> ({order.items.length} items)
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 mr-2">
                        {formatINR(order.total)}
                      </span>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleAdvanceOrderStatus(order)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
                        >
                          {order.status === 'Order Placed'
                            ? 'Accept Order'
                            : order.status === 'Retailer Accepted'
                            ? 'Start Preparing'
                            : order.status === 'Preparing Order'
                            ? 'Mark Ready'
                            : 'Handover to Delivery'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Management Tab */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Live Order Fulfillment Console</h3>
            <span className="text-xs font-mono text-slate-400">{storeOrders.length} Total Orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {storeOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-3 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-3 px-3">
                      <span className="block text-white font-semibold">{order.customerName}</span>
                      <span className="text-[10px] text-slate-500">{order.deliveryAddress}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatINR(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5">
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' ? (
                        <>
                          <button
                            onClick={() => handleAdvanceOrderStatus(order)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                          >
                            {order.status === 'Order Placed'
                              ? 'Accept'
                              : order.status === 'Retailer Accepted'
                              ? 'Start Prep'
                              : order.status === 'Preparing Order'
                              ? 'Mark Ready'
                              : 'Handover'}
                          </button>
                          {order.status === 'Order Placed' && (
                            <button
                              onClick={() => setRejectingOrderId(order.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white font-bold text-xs transition"
                            >
                              Reject
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-500">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Management Tab */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Live Store Inventory Sync</h3>
              <p className="text-xs text-slate-400">
                Update stock units to prevent out-of-stock customer cancellations
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Search stock..."
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
              />
              <button
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  lowStockOnly
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Low Stock Only
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Selling Price</th>
                  <th className="py-2.5 px-3">Current Stock</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Update Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredStoreProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                        <span className="font-bold text-white">{prod.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{prod.category}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                      {formatINR(prod.price)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {editingProductId === prod.id ? (
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(parseInt(e.target.value) || 0)}
                          className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-white"
                        />
                      ) : (
                        <span className={prod.stock === 0 ? 'text-rose-400' : 'text-white'}>
                          {prod.stock} units
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                          prod.stockStatus === 'In Stock'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : prod.stockStatus === 'Low Stock'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {prod.stockStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {editingProductId === prod.id ? (
                        <button
                          onClick={() => {
                            onUpdateProductStock(prod.id, editStockValue);
                            setEditingProductId(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingProductId(prod.id);
                            setEditStockValue(prod.stock);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Daily Order Volume & Acceptance</h3>
            <div className="h-44 flex items-end space-x-3 pt-6 px-2">
              {[42, 58, 65, 52, 74, 88, 92].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-emerald-400 rounded-t-xl"
                    style={{ height: `${(v / 100) * 120}px` }}
                  />
                  <span className="text-[10px] text-slate-400">Day {i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Cancellation & Stockout Avoidance</h3>
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>Order Acceptance Rate</span>
                  <span className="text-emerald-400">96.8%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[96.8%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>On-Time Prep SLA</span>
                  <span className="text-indigo-400">92.4%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[92.4%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-bold mb-1">
                  <span>Stock Accuracy Reliability</span>
                  <span className="text-cyan-400">{currentStore.reliabilityScore}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-[88%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Reason Dialog */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-white">Record Order Rejection Reason</h3>
            <p className="text-xs text-slate-400">
              Provide an operational explanation. This logs an incident in the Admin Order Rescue Center and notifies the customer.
            </p>

            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            >
              <option value="Out of stock at store shelf">Out of stock at store shelf</option>
              <option value="Peak in-store rush / Cannot prepare in time">Peak in-store rush / Cannot prepare in time</option>
              <option value="Store closing / Inventory audit">Store closing / Inventory audit</option>
              <option value="Packaging material shortage">Packaging material shortage</option>
            </select>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
