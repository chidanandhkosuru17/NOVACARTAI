import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  MapPin,
  ChevronDown,
  Star,
  Clock,
  Sparkles,
  Store as StoreIcon,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  Trash2,
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Heart,
  Award,
  ArrowRight,
  Filter,
  Check,
  SlidersHorizontal,
} from 'lucide-react';
import {
  StoreItem,
  CatalogProduct,
  CustomerOrder,
  OrderItem,
  INITIAL_STORES,
  INITIAL_PRODUCTS,
} from '../../services/firestoreService';
import { formatINR } from '../../utils/formatters';

interface CustomerAppProps {
  stores: StoreItem[];
  products: CatalogProduct[];
  orders: CustomerOrder[];
  onPlaceOrder: (newOrder: CustomerOrder) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  stores,
  products,
  orders,
  onPlaceOrder,
  onUpdateProductStock,
}) => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'home' | 'discovery' | 'orders' | 'profile'>('home');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('Madhapur');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart State
  const [cart, setCart] = useState<{ product: CatalogProduct; quantity: number }[]>([
    { product: products[0], quantity: 1 },
    { product: products[3], quantity: 2 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string>('NEIGHBOR30');
  const [couponDiscount, setCouponDiscount] = useState<number>(30);
  const [couponMessage, setCouponMessage] = useState<string>('Coupon NEIGHBOR30 applied (₹30 off)');

  // Product Detail & Substitution Modal
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [substitutionStore, setSubstitutionStore] = useState<StoreItem | null>(null);

  // Checkout Form State
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'UPI Demo' | 'Cash on Delivery' | 'Card Demo'>('UPI Demo');
  const [deliverySlot, setDeliverySlot] = useState<string>('Instant (Within 25 mins)');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('Flat 402, Sai Residency, Madhapur, Hyderabad - 500081');

  // Customer Loyalty Points
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(720);

  // Neighborhoods in Hyderabad
  const neighborhoods = ['Madhapur', 'Kukatpally', 'Gachibowli', 'Kondapur', 'Miyapur'];

  // Categories list
  const categories = [
    { name: 'All', icon: '✨' },
    { name: 'Groceries', icon: '🛒' },
    { name: 'Fruits & Vegetables', icon: '🍎' },
    { name: 'Pharmacy', icon: '💊' },
    { name: 'Bakery', icon: '🍞' },
    { name: 'Stationery', icon: '✏️' },
    { name: 'Dairy', icon: '🥛' },
    { name: 'Daily Essentials', icon: '⚡' },
  ];

  // Cart Totals
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  const deliveryFee = subtotal > 400 || subtotal === 0 ? 0 : 25;
  const finalTotal = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Cart operations
  const handleAddToCart = (product: CatalogProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is { product: CatalogProduct; quantity: number } => item !== null);
    });
  };

  // Substitution Engine logic
  const handleOpenProductDetail = (product: CatalogProduct) => {
    setSelectedProduct(product);
    if (product.stock === 0) {
      // Find an alternative store that sells groceries or dairy
      const alt = stores.find((s) => s.id !== product.storeId && s.status === 'Open') || stores[0];
      setSubstitutionStore(alt);
    } else {
      setSubstitutionStore(null);
    }
  };

  // Place Order Action
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    const firstStoreId = cart[0].product.storeId;
    const firstStoreName = cart[0].product.storeName;

    const orderId = `NC-HYD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: CustomerOrder = {
      id: orderId,
      customerId: 'cust-priya-sharma',
      customerName: 'Priya Sharma',
      customerPhone: '+91 98490 12345',
      storeId: firstStoreId,
      storeName: firstStoreName,
      items: cart.map((c) => ({
        productId: c.product.id,
        name: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.image,
      })),
      subtotal,
      deliveryFee,
      discount: couponDiscount,
      total: finalTotal,
      status: 'Order Placed',
      paymentMethod: checkoutPaymentMethod,
      deliveryAddress,
      estimatedArrival: '18-22 mins (Arriving ~3:50 PM)',
      delayMinutes: 0,
      createdAt: new Date().toISOString(),
    };

    onPlaceOrder(newOrder);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setLoyaltyPoints((pts) => pts + Math.round(finalTotal * 0.05));
    setActiveTab('orders');
  };

  // Filtered Products for Discovery
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.storeName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Customer Sub-Navbar */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Location & Hyderabad Selector */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Delivering to Hyderabad
              </span>
              <div className="relative inline-block">
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="bg-transparent text-xs font-black text-white pr-6 py-0.5 cursor-pointer focus:outline-none appearance-none"
                >
                  {neighborhoods.map((n) => (
                    <option key={n} value={n} className="bg-slate-900 text-white">
                      {n}, Hyderabad
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-0 top-1 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Atta, Milk, Bananas, Medicines, Bakery..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Customer Navigation Tabs & Cart Trigger */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'home'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Shop Home
            </button>
            <button
              onClick={() => setActiveTab('discovery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'discovery'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              Browse Catalog
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <span>Track Orders</span>
              {orders.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] flex items-center justify-center">
                  {orders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{loyaltyPoints} Pts</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold hover:brightness-110 shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs">{cart.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Screen 1: Customer Home Page */}
      {activeTab === 'home' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-8 text-white shadow-2xl border border-indigo-500/30">
            <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="max-w-2xl space-y-4 relative z-10">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>HYPERLOCAL QUICK-COMMERCE ECOSYSTEM</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Your Neighborhood. Your Shopping. <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  One NOVA CART.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Discover verified local Kirana stores, pharmacies, and artisan bakeries in {selectedNeighborhood},
                Hyderabad. Everyday essentials delivered from neighborhood shops within 15–25 minutes.
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setActiveTab('discovery')}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
                >
                  <span>Explore Stores</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab('discovery')}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs transition"
                >
                  Shop Essentials
                </button>
              </div>
            </div>
          </div>

          {/* Categories Pill Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Shop By Category
              </h2>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setActiveTab('discovery');
                }}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                View All Categories →
              </button>
            </div>
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setActiveTab('discovery');
                  }}
                  className={`px-4 py-2 rounded-2xl border text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                    selectedCategory === cat.name
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Neighborhood Products */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Trending Essentials Near You
                </h2>
                <p className="text-xs text-slate-400">
                  Popular items ordered by neighbors in {selectedNeighborhood}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('discovery')}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                See All Products
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/40 transition group flex flex-col justify-between shadow-xl"
                >
                  <div
                    onClick={() => handleOpenProductDetail(product)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-44 overflow-hidden bg-slate-950">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-300 border border-slate-800">
                        {product.category}
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-400 flex items-center border border-slate-800">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {product.rating}
                      </div>
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-black text-xs">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center">
                        <StoreIcon className="w-3 h-3 mr-1 text-slate-500" />
                        {product.storeName}
                      </span>
                      <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-300 transition">
                        {product.name}
                      </h3>
                      <div className="flex items-center space-x-2 pt-1">
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {formatINR(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-slate-500 line-through font-mono">
                            {formatINR(product.originalPrice)}
                          </span>
                        )}
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-1">
                    {product.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 rounded-2xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenProductDetail(product)}
                        className="w-full py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        <span>Find Alternatives</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Stores in Hyderabad */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Nearby Neighborhood Stores
                </h2>
                <p className="text-xs text-slate-400">
                  Support local merchants and neighborhood provision shops in {selectedNeighborhood}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="p-4 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 hover:border-indigo-500/40 transition shadow-xl space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                            store.status === 'Open'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : store.status === 'Busy'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {store.status}
                        </span>
                        <span className="text-[10px] text-slate-400">• {store.category}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white truncate">{store.name}</h3>
                      <p className="text-[10px] text-slate-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500" />
                        {store.location} ({store.distance})
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      ~{store.estimatedPreparationTime} min prep
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCategory(store.category);
                        setActiveTab('discovery');
                      }}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      View Products ({store.productCount}) →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 2: Dedicated Product Discovery */}
      {activeTab === 'discovery' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <h2 className="text-base font-bold text-white">
                Discover Neighborhood Catalog ({filteredProducts.length} Items)
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Filter by:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-1.5"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/40 transition flex flex-col justify-between"
                >
                  <div
                    onClick={() => handleOpenProductDetail(product)}
                    className="cursor-pointer"
                  >
                    <div className="relative h-40 bg-slate-900">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate-300">
                        {product.category}
                      </div>
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 space-y-1">
                      <span className="text-[10px] text-slate-400 block truncate">
                        {product.storeName}
                      </span>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-2 pt-1 font-mono">
                        <span className="text-sm font-bold text-emerald-400">
                          {formatINR(product.price)}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          {formatINR(product.originalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 pt-0">
                    {product.stock > 0 ? (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenProductDetail(product)}
                        className="w-full py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-bold transition"
                      >
                        Find Alternative
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screen 6: Order Tracking Page */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">
                  Real-Time Order Tracking & History
                </h2>
                <p className="text-xs text-slate-400">
                  Shared synchronized order status across Retailer and Customer environments
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                {orders.length} Active Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No orders placed yet. Add items to your cart to test the full lifecycle!
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const stages = [
                    'Order Placed',
                    'Retailer Accepted',
                    'Preparing Order',
                    'Ready for Pickup',
                    'Out for Delivery',
                    'Delivered',
                  ];
                  const currentStageIdx = stages.indexOf(order.status);

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-black text-white">
                              {order.id}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : order.status === 'Delayed'
                                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                                  : 'bg-indigo-500/20 text-indigo-400'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Store: <strong className="text-slate-200">{order.storeName}</strong> •{' '}
                            {order.items.length} items • Total: {formatINR(order.total)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-mono text-amber-300 font-bold block">
                            {order.estimatedArrival}
                          </span>
                          <span className="text-[10px] text-slate-500">{order.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Transparent Delay Warning If Delayed */}
                      {order.delayMinutes && order.delayMinutes > 0 ? (
                        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-300 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                          <span>
                            <strong>Transparent Delay Notice:</strong> This order is experiencing a {order.delayMinutes}-minute delay due to peak neighborhood dispatch traffic. Our team is monitoring the route.
                          </span>
                        </div>
                      ) : null}

                      {/* Visual Timeline (6 Stages) */}
                      <div className="pt-2">
                        <div className="grid grid-cols-6 gap-1 relative">
                          {stages.map((stage, idx) => {
                            const isPassed = currentStageIdx >= idx;
                            const isCurrent = currentStageIdx === idx;
                            return (
                              <div key={stage} className="text-center space-y-1.5">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isPassed
                                      ? 'bg-emerald-500 shadow-sm'
                                      : 'bg-slate-800'
                                  }`}
                                />
                                <span
                                  className={`text-[9px] block leading-tight font-medium ${
                                    isCurrent
                                      ? 'text-emerald-400 font-bold'
                                      : isPassed
                                      ? 'text-slate-300'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order items preview */}
                      <div className="pt-3 border-t border-slate-900 text-xs text-slate-400 flex items-center justify-between">
                        <span>Delivery to: {order.deliveryAddress}</span>
                        <span className="text-slate-500 font-mono">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 7: Customer Profile & Loyalty System */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Profile Info Card */}
            <div className="md:col-span-4 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 text-slate-950 font-black text-xl flex items-center justify-center mx-auto shadow-lg">
                  PS
                </div>
                <h3 className="text-sm font-bold text-white">Priya Sharma</h3>
                <p className="text-xs text-slate-400">priya.sharma@hyderabad.in</p>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Verified Local Buyer • 3-Streak Member
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Saved Address</span>
                  <span className="text-white font-semibold text-right">Madhapur, Hyderabad</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Completed Orders</span>
                  <span className="text-white font-mono font-bold">14 Orders</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Favorite Store</span>
                  <span className="text-emerald-400 font-semibold">Balaji Provisions</span>
                </div>
              </div>
            </div>

            {/* Loyalty Rewards & Milestone Gamification */}
            <div className="md:col-span-8 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    NOVA CART 3-Streak Milestone Loyalty
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {loyaltyPoints} Reward Points
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Complete 3 orders per month to unlock <strong>VIP Neighborhood Delivery</strong> and earn ₹100 cashback
                credits for local grocery restocks.
              </p>

              {/* 3-Streak Visual Progress */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Monthly 3-Streak Streak</span>
                  <span className="font-mono text-emerald-400 font-bold">2 of 3 Completed (66%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-2/3 rounded-full" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Place 1 more neighborhood grocery order this week to unlock ₹50 bonus cashback on your next Kirana basket!
                </p>
              </div>

              {/* Redeemable Rewards Cards */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">₹50 Store Credit</span>
                    <span className="text-[10px] text-slate-400">Costs 400 pts</span>
                  </div>
                  <button
                    disabled={loyaltyPoints < 400}
                    onClick={() => setLoyaltyPoints((p) => p - 400)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-40"
                  >
                    Redeem
                  </button>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Free Priority Delivery</span>
                    <span className="text-[10px] text-slate-400">Costs 250 pts</span>
                  </div>
                  <button
                    disabled={loyaltyPoints < 250}
                    onClick={() => setLoyaltyPoints((p) => p - 250)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold disabled:opacity-40"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Product Detail & Substitution Engine Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="relative h-60 bg-slate-950">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                  {selectedProduct.category} • {selectedProduct.storeName}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedProduct.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatINR(selectedProduct.price)}
                </span>
                <span className="text-sm text-slate-500 line-through font-mono">
                  {formatINR(selectedProduct.originalPrice)}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  In-Store Local Stock
                </span>
              </div>

              {/* Substitution Engine when product is Out of Stock */}
              {selectedProduct.stock === 0 && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>This product is currently out of stock at {selectedProduct.storeName}.</span>
                  </div>

                  {substitutionStore && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase">
                        AI Recommended Alternative Store
                      </span>
                      <p className="font-bold text-white">
                        {substitutionStore.name} ({substitutionStore.distance})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Available in stock for delivery in ~{substitutionStore.estimatedPreparationTime + 10} mins.
                      </p>
                      <button
                        onClick={() => {
                          // Substitute product store
                          const subProduct = {
                            ...selectedProduct,
                            storeId: substitutionStore.id,
                            storeName: substitutionStore.name,
                            stock: 10,
                            stockStatus: 'In Stock' as const,
                          };
                          handleAddToCart(subProduct);
                          setSelectedProduct(null);
                        }}
                        className="w-full mt-2 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition"
                      >
                        Accept Alternative Store & Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedProduct.stock > 0 && (
                <button
                  onClick={() => {
                    handleAddToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Cart ({formatINR(selectedProduct.price)})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Screen 4: Shopping Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Your NOVA CART</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-500 space-y-2">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-700" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-4 my-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatINR(item.product.price)} each
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, -1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, 1)}
                            className="text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-4">
                {/* Coupon Box */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. NEIGHBOR30)"
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white uppercase font-mono"
                  />
                  <button
                    onClick={() => {
                      if (couponCode === 'NEIGHBOR30' || couponCode === 'WELCOME50') {
                        setCouponDiscount(couponCode === 'WELCOME50' ? 50 : 30);
                        setCouponMessage(`Coupon ${couponCode} applied successfully!`);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-[10px] text-emerald-400 font-semibold">{couponMessage}</p>
                )}

                {/* Transparent Price Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-mono">{deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Neighborhood Promo Discount</span>
                      <span className="font-mono">-{formatINR(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                    <span>Final Total</span>
                    <span className="font-mono text-emerald-400">{formatINR(finalTotal)}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 text-[10px] text-slate-400 leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                  <strong>No unexpected charges.</strong> Your total is shown before placing the order.
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg transition"
                >
                  Proceed to Checkout ({formatINR(finalTotal)})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Screen 5: Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Complete Your Neighborhood Order</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery Details */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Delivery Address (Hyderabad)</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Delivery Slot</label>
                <select
                  value={deliverySlot}
                  onChange={(e) => setDeliverySlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  <option value="Instant (Within 25 mins)">Instant Dispatch (Within 25 mins)</option>
                  <option value="Evening Slot (6:00 PM - 7:30 PM)">Evening Slot (6:00 PM - 7:30 PM)</option>
                  <option value="Tomorrow Morning (8:00 AM - 9:30 AM)">Tomorrow Morning (8:00 AM - 9:30 AM)</option>
                </select>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI Demo', 'Cash on Delivery', 'Card Demo'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setCheckoutPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        checkoutPaymentMethod === method
                          ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-[11px] block">{method}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total and Place Order */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Due</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  {formatINR(finalTotal)}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-lg transition"
              >
                Place Order (Demo Mode)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
