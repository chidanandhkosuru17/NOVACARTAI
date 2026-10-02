import React from 'react';
import {
  LayoutDashboard,
  Users,
  PackageSearch,
  Truck,
  Flame,
  LifeBuoy,
  Cpu,
  CalendarCheck2,
  Sparkles,
  MapPin,
  Globe,
  Film,
  ChevronRight,
} from 'lucide-react';

export type TabKey =
  | 'executive'
  | 'customer_intelligence'
  | 'inventory'
  | 'order_rescue'
  | 'promotions'
  | 'support'
  | 'simulator'
  | 'action_plan'
  | 'recommendations'
  | 'store_radar'
  | 'market_trends'
  | 'promo_studio'
  | 'ai_copilot';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  openOrdersAtRisk: number;
  openTickets: number;
  lowStockItemsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openOrdersAtRisk,
  openTickets,
  lowStockItemsCount,
}) => {
  const coreNavItems = [
    {
      key: 'executive' as TabKey,
      label: 'Executive Dashboard',
      subtitle: 'Overview & Health Matrix',
      icon: LayoutDashboard,
      badge: null,
      glow: 'from-emerald-500 to-teal-500',
    },
    {
      key: 'customer_intelligence' as TabKey,
      label: 'Customer Intelligence',
      subtitle: 'Cohorts & Retention',
      icon: Users,
      badge: '3-Streak',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      glow: 'from-emerald-500 to-cyan-500',
    },
    {
      key: 'inventory' as TabKey,
      label: 'Smart Inventory',
      subtitle: '620 Retailers Stock Sync',
      icon: PackageSearch,
      badge: lowStockItemsCount > 0 ? `${lowStockItemsCount} Low` : null,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      glow: 'from-amber-500 to-orange-500',
    },
    {
      key: 'order_rescue' as TabKey,
      label: 'Order Rescue & Delivery',
      subtitle: 'Live Delays & Mitigation',
      icon: Truck,
      badge: openOrdersAtRisk > 0 ? `${openOrdersAtRisk} Risk` : null,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      glow: 'from-rose-500 to-pink-500',
    },
    {
      key: 'simulator' as TabKey,
      label: 'Business Rescue Sim',
      subtitle: '₹25L 6-Month Projection',
      icon: Cpu,
      badge: 'Interactive',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
      highlight: true,
      glow: 'from-indigo-500 to-purple-500',
    },
  ];

  const intelligenceNavItems = [
    {
      key: 'store_radar' as TabKey,
      label: 'Store Maps Radar',
      subtitle: 'Google Maps Grounding',
      icon: MapPin,
      badge: 'Maps',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      glow: 'from-emerald-400 to-green-500',
    },
    {
      key: 'market_trends' as TabKey,
      label: 'Market Trends & SLA',
      subtitle: 'Google Search Grounding',
      icon: Globe,
      badge: 'Search',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
      glow: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'promo_studio' as TabKey,
      label: 'Promo Video Studio',
      subtitle: 'Veo Video Generations',
      icon: Film,
      badge: 'Veo 3.1',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
      glow: 'from-purple-500 to-pink-500',
    },
    {
      key: 'ai_copilot' as TabKey,
      label: 'AI Business Copilot',
      subtitle: 'Strategic Q&A Engine',
      icon: Sparkles,
      badge: 'Copilot',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
      glow: 'from-indigo-400 to-purple-500',
    },
  ];

  const secondaryNavItems = [
    {
      key: 'promotions' as TabKey,
      label: 'Smart Promotions',
      subtitle: 'Campaigns & ROI Sim',
      icon: Flame,
      badge: '44% Waste',
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    },
    {
      key: 'support' as TabKey,
      label: 'Support & Refunds',
      subtitle: 'Dispute Desk & Resolution',
      icon: LifeBuoy,
      badge: openTickets > 0 ? `${openTickets} Open` : null,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
    {
      key: 'action_plan' as TabKey,
      label: '6-Month Plan & Budget',
      subtitle: '₹25 Lakh Roadmap',
      icon: CalendarCheck2,
      badge: '₹25L Cap',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      key: 'recommendations' as TabKey,
      label: 'AI Recommendation Hub',
      subtitle: 'Explainable Rule Engine',
      icon: Sparkles,
      badge: '5 Alerts',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
  ];

  return (
    <aside className="hidden sm:flex w-64 md:w-72 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex-col justify-between py-4 shadow-2xl select-none text-slate-300">
      <div className="overflow-y-auto px-2 space-y-4">
        {/* Core Turnaround Modules */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Core Turnaround Engines
          </div>
          <nav className="space-y-1">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 via-slate-800 to-indigo-500/20 text-white border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  } ${item.highlight && !isActive ? 'ring-1 ring-indigo-500/30 bg-indigo-950/20' : ''}`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                        isActive
                          ? `bg-gradient-to-tr ${item.glow} text-slate-950 shadow-md scale-105 font-bold`
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] truncate text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI & Intelligence Grounding Tools */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>AI & Grounding Studio</span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">GEMINI + VEO</span>
          </div>
          <nav className="space-y-1">
            {intelligenceNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 via-slate-800 to-cyan-500/20 text-white border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                        isActive
                          ? `bg-gradient-to-tr ${item.glow} text-slate-950 shadow-md scale-105 font-bold`
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {item.label}
                      </p>
                      <p className="text-[10px] truncate text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Operational Modules */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Operations & Planning
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`w-full text-left px-3 py-2 rounded-2xl transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:text-slate-200">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{item.label}</p>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mini Rescue Status Footer */}
      <div className="px-3 mt-4 pt-3 border-t border-slate-800">
        <div className="p-3 bg-gradient-to-br from-slate-950 to-indigo-950 rounded-2xl text-white shadow-inner border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-emerald-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Rescue Fund Allocation
            </span>
            <span className="text-[10px] font-mono text-slate-300 font-bold">₹25.0 Lakh</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full w-full rounded-full" />
          </div>
          <p className="text-[9px] text-slate-400 leading-tight">
            620 Retailers • 3 Metros • ₹25L 6-Month Cap
          </p>
        </div>
      </div>
    </aside>
  );
};
