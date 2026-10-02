import React, { useState } from 'react';
import {
  PackageSearch,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Store,
  Layers,
  TrendingUp,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { InventoryItem, RetailerCategory, City } from '../types';
import { formatINR } from '../utils/formatters';

interface SmartInventoryProps {
  inventory: InventoryItem[];
  onUpdateInventory: (items: InventoryItem[]) => void;
}

export const SmartInventory: React.FC<SmartInventoryProps> = ({
  inventory,
  onUpdateInventory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New product form state
  const [newStoreName, setNewStoreName] = useState('Sri Krishna Kirana & General Store');
  const [newCity, setNewCity] = useState<City>('Bengaluru');
  const [newCategory, setNewCategory] = useState<RetailerCategory>('Grocery');
  const [newProductName, setNewProductName] = useState('');
  const [newStock, setNewStock] = useState<number>(10);
  const [newPrice, setNewPrice] = useState<number>(150);
  const [newUnit, setNewUnit] = useState('pack');

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || item.city === selectedCity;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'low' && (item.stockStatus === 'Low Stock' || item.availableStock < 5)) ||
      (selectedStatus === 'out' && item.availableStock === 0) ||
      (selectedStatus === 'stale' && item.stockStatus === 'Stale Inventory') ||
      (selectedStatus === 'risk' && item.mismatchRisk);

    return matchesSearch && matchesCategory && matchesCity && matchesStatus;
  });

  // Calculate dynamic accuracy
  const mismatchCount = inventory.filter((i) => i.mismatchRisk).length;
  const accuracyPercentage = Math.round(((inventory.length - mismatchCount) / inventory.length) * 100);

  // Stock adjustment handlers
  const handleStockDelta = (id: string, delta: number) => {
    const updated = inventory.map((item) => {
      if (item.id === id) {
        const nextStock = Math.max(0, item.availableStock + delta);
        let nextStatus: InventoryItem['stockStatus'] = 'In Stock';
        let available = item.productAvailability;

        if (nextStock === 0) {
          nextStatus = 'Out of Stock';
          available = false;
        } else if (nextStock < 5) {
          nextStatus = 'Low Stock';
        }

        const mismatch = nextStock === 0 || (nextStock < 5 && (item.orderDemand === 'High' || item.orderDemand === 'Surge'));

        return {
          ...item,
          availableStock: nextStock,
          stockStatus: nextStatus,
          productAvailability: available,
          lastUpdated: 'Just now',
          mismatchRisk: mismatch,
        };
      }
      return item;
    });

    onUpdateInventory(updated);
  };

  const handleToggleAvailability = (id: string) => {
    const updated = inventory.map((item) => {
      if (item.id === id) {
        const nextAvail = !item.productAvailability;
        return {
          ...item,
          productAvailability: nextAvail,
          lastUpdated: 'Just now',
          mismatchRisk: !nextAvail ? false : item.mismatchRisk,
        };
      }
      return item;
    });
    onUpdateInventory(updated);
  };

  const handleVerifyStock = (id: string) => {
    const updated = inventory.map((item) => {
      if (item.id === id) {
        let newStatus: InventoryItem['stockStatus'] = 'In Stock';
        if (item.availableStock === 0) {
          newStatus = 'Out of Stock';
        } else if (item.availableStock < 5) {
          newStatus = 'Low Stock';
        }
        return {
          ...item,
          stockStatus: newStatus,
          lastUpdated: 'Verified just now',
          mismatchRisk: item.availableStock === 0,
        };
      }
      return item;
    });
    onUpdateInventory(updated);
    setNotification('Store inventory verified successfully via WhatsApp ping!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      storeName: newStoreName,
      city: newCity,
      category: newCategory,
      productName: newProductName.trim(),
      availableStock: Number(newStock),
      unit: newUnit,
      price: Number(newPrice),
      stockStatus: Number(newStock) === 0 ? 'Out of Stock' : Number(newStock) < 5 ? 'Low Stock' : 'In Stock',
      lastUpdated: 'Just now',
      productAvailability: Number(newStock) > 0,
      orderDemand: 'Medium',
      mismatchRisk: Number(newStock) === 0,
    };

    onUpdateInventory([newItem, ...inventory]);
    setIsAddModalOpen(false);
    setNewProductName('');
    setNotification(`"${newItem.productName}" added to ${newItem.storeName} catalog!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Retailer Stock Accuracy & Cancellation Prevention Correlation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <Store className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Local Retailer Smart Inventory Sync (620 Stores)
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Core Root Cause:</strong> 62% of NOVA CART cancellations occur because customers purchase products that local stores do not have on their shelves.
              Automating 1-tap WhatsApp verification and auto-masking zero-stock items stops ghost orders before dispatch.
            </p>
          </div>

          {/* Accuracy KPI and Impact Card */}
          <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex-shrink-0">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Stock Accuracy</div>
              <div className="text-2xl font-black text-slate-900 flex items-center">
                {accuracyPercentage}%
                <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  Target: 95%
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {mismatchCount} items flagged with mismatch risk
              </div>
            </div>
            <div className="w-px h-10 bg-slate-300" />
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase">Cancellation Recovery</div>
              <div className="text-lg font-bold text-emerald-600">
                ~2,400 orders/mo
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Saved by real-time catalog masking
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {notification}
        </div>
      )}

      {/* Control Bar: Search, Filters, Add Product */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-1 sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products or store names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-initial text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 sm:py-1.5 focus:outline-none text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="Grocery">Grocery</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Bakery">Bakery</option>
              <option value="Stationery">Stationery</option>
              <option value="Neighborhood Mart">Neighborhood Mart</option>
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="flex-1 sm:flex-initial text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 sm:py-1.5 focus:outline-none text-slate-700"
            >
              <option value="all">All Cities</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto justify-between sm:justify-end">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All Items ({inventory.length})
            </button>
            <button
              onClick={() => setSelectedStatus('low')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'low' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setSelectedStatus('stale')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                selectedStatus === 'stale' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Stale (&gt;24h)
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add SKU
          </button>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Store & Location</th>
                <th className="py-3 px-4">Product Name & Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4">Status & Health</th>
                <th className="py-3 px-4">Last Sync</th>
                <th className="py-3 px-4 text-center">Customer Visible</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{item.storeName}</div>
                    <div className="text-[10px] text-slate-500 flex items-center mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5" />
                      {item.city}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{item.productName}</div>
                    <div className="text-[10px] text-slate-500">
                      Category: <span className="font-medium text-slate-700">{item.category}</span> • Demand:{' '}
                      <span
                        className={`font-bold ${
                          item.orderDemand === 'Surge'
                            ? 'text-rose-600'
                            : item.orderDemand === 'High'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.orderDemand}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    ₹{item.price}
                    <span className="text-[10px] text-slate-400 font-normal ml-0.5">/{item.unit}</span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-lg">
                      <button
                        onClick={() => handleStockDelta(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
                        title="Reduce 1"
                      >
                        -
                      </button>
                      <span className="w-8 font-mono font-bold text-xs text-center text-slate-900">
                        {item.availableStock}
                      </span>
                      <button
                        onClick={() => handleStockDelta(item.id, 1)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200"
                        title="Add 1"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold w-fit ${
                          item.stockStatus === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.stockStatus === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800'
                            : item.stockStatus === 'Stale Inventory'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.stockStatus}
                      </span>
                      {item.mismatchRisk && (
                        <span className="text-[10px] text-rose-600 flex items-center font-medium">
                          <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                          Risk: Stockout likely
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-slate-500 font-mono">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{item.lastUpdated}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        item.productAvailability
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {item.productAvailability ? 'Active (Live)' : 'Masked (Hidden)'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleVerifyStock(item.id)}
                      className="inline-flex items-center px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg text-[11px] font-semibold transition"
                      title="Simulate WhatsApp Kirana 1-tap verification"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Verify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Add SKU to Retailer Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value as City)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RetailerCategory)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Neighborhood Mart">Neighborhood Mart</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Amul Butter (500g)"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
