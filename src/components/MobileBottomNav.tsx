import React from 'react';
import {
  LayoutDashboard,
  Users,
  PackageSearch,
  Truck,
  Cpu,
  Menu,
} from 'lucide-react';
import { TabKey } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenDrawer: () => void;
  openOrdersAtRisk: number;
  lowStockCount: number;
  openTickets: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenDrawer,
  openOrdersAtRisk,
  lowStockCount,
  openTickets,
}) => {
  const tabs = [
    {
      key: 'executive' as TabKey,
      label: 'Executive',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      key: 'customer_intelligence' as TabKey,
      label: 'Retention',
      icon: Users,
      badge: '3★',
      badgeColor: 'bg-emerald-500',
    },
    {
      key: 'inventory' as TabKey,
      label: 'Inventory',
      icon: PackageSearch,
      badge: lowStockCount > 0 ? String(lowStockCount) : null,
      badgeColor: 'bg-amber-500',
    },
    {
      key: 'order_rescue' as TabKey,
      label: 'Rescue',
      icon: Truck,
      badge: openOrdersAtRisk > 0 ? String(openOrdersAtRisk) : null,
      badgeColor: 'bg-rose-500',
    },
    {
      key: 'simulator' as TabKey,
      label: 'Simulator',
      icon: Cpu,
      badge: '₹25L',
      badgeColor: 'bg-indigo-500',
      highlight: true,
    },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl flex items-center justify-around px-1 py-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
              isActive
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1.5 rounded-lg transition-transform ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 scale-105'
                  : tab.highlight
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            <span className="text-[10px] mt-0.5 leading-none font-medium truncate max-w-[56px]">
              {tab.label}
            </span>

            {tab.badge && (
              <span
                className={`absolute top-0.5 right-2 text-[9px] px-1 py-0.2 rounded-full font-bold text-white shadow-sm ${
                  tab.badgeColor || 'bg-slate-700'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}

      {/* "More" Drawer Button */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center flex-1 py-1 px-1 text-slate-400 hover:text-slate-200 rounded-xl relative"
        title="Open full menu"
      >
        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 leading-none font-medium">More</span>
        {openTickets > 0 && (
          <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        )}
      </button>
    </nav>
  );
};
