import React from 'react';
import {
  X,
  Flame,
  LifeBuoy,
  CalendarCheck2,
  Sparkles,
  Compass,
  FileSpreadsheet,
  Download,
  ShoppingBag,
  ShieldCheck,
  LogIn,
  LogOut,
  ChevronRight,
  TrendingDown,
  Clock,
  MapPin,
  Globe,
  Film,
} from 'lucide-react';
import { TabKey } from './Sidebar';
import { useAuth } from '../firebase/authContext';
import { formatINR } from '../utils/formatters';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenTour: () => void;
  onOpenReport: () => void;
  openTickets: number;
  monthlyRevenue: number;
  repeatRate: number;
  cancellationRate: number;
  deliveryTime: number;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  onOpenTour,
  onOpenReport,
  openTickets,
  monthlyRevenue,
  repeatRate,
  cancellationRate,
  deliveryTime,
}) => {
  const { currentUser, signInWithGoogle, logOut, enableDemoUser } = useAuth();

  if (!isOpen) return null;

  const aiIntelligenceItems = [
    {
      key: 'store_radar' as TabKey,
      label: 'Store Maps Radar',
      subtitle: 'Google Maps Grounding',
      icon: MapPin,
      badge: 'Maps',
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      key: 'market_trends' as TabKey,
      label: 'Market Trends Radar',
      subtitle: 'Google Search Grounding',
      icon: Globe,
      badge: 'Search',
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      key: 'promo_studio' as TabKey,
      label: 'Promo Video Studio',
      subtitle: 'Veo Video Generations (16:9 / 9:16)',
      icon: Film,
      badge: 'Veo 3.1',
      color: 'text-purple-400 bg-purple-500/10',
    },
  ];

  const secondaryNavItems = [
    {
      key: 'promotions' as TabKey,
      label: 'Smart Promotions & Reallocation',
      subtitle: 'Campaign portfolio & burn optimization',
      icon: Flame,
      badge: '44% Waste',
      color: 'text-purple-400 bg-purple-500/10',
    },
    {
      key: 'support' as TabKey,
      label: 'Customer Support & Rapid Refunds',
      subtitle: 'Dispute desk, SLA & instant UPI webhooks',
      icon: LifeBuoy,
      badge: openTickets > 0 ? `${openTickets} Open` : null,
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      key: 'action_plan' as TabKey,
      label: 'Six-Month Roadmap & ₹25L Budget',
      subtitle: 'Timeline checklist & capital ceiling allocator',
      icon: CalendarCheck2,
      badge: '₹25L Cap',
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      key: 'recommendations' as TabKey,
      label: 'AI Recommendation Hub',
      subtitle: 'Explainable rule-based turnaround alerts',
      icon: Sparkles,
      badge: '5 Alerts',
      color: 'text-amber-400 bg-amber-500/10',
    },
  ];

  const handleSelect = (key: TabKey) => {
    onSelectTab(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm sm:hidden animate-in fade-in">
      <div className="w-5/6 max-w-xs bg-slate-900 text-white h-full flex flex-col justify-between shadow-2xl border-l border-slate-800 p-5 overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">NOVA CART</h3>
                <span className="text-[10px] text-emerald-400 font-semibold block">
                  Quick-Commerce Rescue Suite
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Tile for Mobile */}
          <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block">Monthly GMV</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{formatINR(monthlyRevenue)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Repeat Rate</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{repeatRate}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Cancellations</span>
              <span className="font-bold text-rose-400 font-mono text-sm">{cancellationRate}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Avg Delivery</span>
              <span className="font-bold text-amber-300 font-mono text-sm">{deliveryTime}m</span>
            </div>
          </div>

          {/* AI Grounding & Veo Items */}
          <div className="space-y-1.5 mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1 flex items-center justify-between">
              <span>AI Grounding & Studio</span>
              <span className="text-emerald-400 font-mono text-[9px]">GEMINI + VEO</span>
            </span>

            {aiIntelligenceItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold leading-tight truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 flex-shrink-0">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Nav Items */}
          <div className="space-y-1.5 mt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
              Secondary Modules
            </span>

            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold leading-tight truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 flex-shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Competition & Audit Tools */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Executive Evaluation
            </span>

            <button
              onClick={() => {
                onClose();
                onOpenTour();
              }}
              className="w-full p-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-left flex items-center justify-between text-xs font-bold text-indigo-300 hover:bg-indigo-600/50 transition"
            >
              <div className="flex items-center space-x-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Guided Competition Tour</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenReport();
              }}
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-left flex items-center justify-between text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Executive Impact Audit</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Auth / Profile Area at Bottom of Drawer */}
        <div className="pt-4 border-t border-slate-800 mt-6">
          {currentUser?.isDemo ? (
            <div className="space-y-2">
              <button
                onClick={signInWithGoogle}
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center shadow transition"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Sign In with Google
              </button>
              <button
                onClick={() => enableDemoUser('admin')}
                className="w-full py-1.5 text-[11px] text-slate-400 hover:text-slate-200 text-center"
              >
                Switch to Super Admin (Demo Mode)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-xs">
              <div className="flex items-center space-x-2 truncate">
                {currentUser?.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="User"
                    className="w-7 h-7 rounded-full border border-emerald-400"
                  />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                )}
                <div className="truncate">
                  <p className="font-bold text-slate-200 truncate max-w-[120px]">
                    {currentUser?.displayName || currentUser?.email}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-mono uppercase">
                    {currentUser?.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logOut}
                className="p-1.5 text-slate-400 hover:text-rose-400"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
