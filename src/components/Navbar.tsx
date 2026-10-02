import React, { useState } from 'react';
import {
  ShoppingBag,
  TrendingDown,
  Clock,
  Sparkles,
  FileSpreadsheet,
  Compass,
  LogIn,
  LogOut,
  ShieldCheck,
  Download,
  Share2,
  X,
  Store,
  LayoutDashboard,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { formatINR } from '../utils/formatters';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AlertsNotificationDropdown } from './AlertsNotificationDropdown';
import { TabKey } from './Sidebar';

export type UserEnvironment = 'customer' | 'retailer' | 'admin';

interface NavbarProps {
  onOpenTour: () => void;
  onOpenReport: () => void;
  monthlyRevenue: number;
  repeatRate: number;
  cancellationRate: number;
  deliveryTime: number;
  supportTickets?: number;
  unusedCouponRate?: number;
  onNavigateTab?: (tab: TabKey) => void;
  currentEnvironment: UserEnvironment;
  onSwitchEnvironment: (env: UserEnvironment) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTour,
  onOpenReport,
  monthlyRevenue,
  repeatRate,
  cancellationRate,
  deliveryTime,
  supportTickets = 5900,
  unusedCouponRate = 44,
  onNavigateTab = () => {},
  currentEnvironment,
  onSwitchEnvironment,
}) => {
  const { currentUser, signInWithGoogle, logOut, enableDemoUser } = useAuth();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#10182B] border-b border-slate-800 text-white shadow-xl pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Brand Identity & Demo Mode Indicator */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#22D3EE] flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-base sm:text-xl tracking-tight text-[#F8FAFC]">
                    NOVA CART
                  </span>
                  <div className="hidden sm:inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>DEMO MODE</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 hidden md:block">
                  AI-Powered Local Commerce & Business Rescue Ecosystem
                </p>
              </div>
            </div>

            {/* 3-Way Connected Environment Switcher */}
            <div className="flex items-center bg-[#080D1D] p-1 rounded-2xl border border-slate-800 text-xs shadow-inner">
              <button
                onClick={() => onSwitchEnvironment('customer')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  currentEnvironment === 'customer'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Customer Shopping Interface"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customer App</span>
                <span className="sm:hidden">Customer</span>
              </button>

              <button
                onClick={() => onSwitchEnvironment('retailer')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  currentEnvironment === 'retailer'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Retailer Management Portal"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Retailer Portal</span>
                <span className="sm:hidden">Retailer</span>
              </button>

              <button
                onClick={() => onSwitchEnvironment('admin')}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1.5 ${
                  currentEnvironment === 'admin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Admin Command Center"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Center</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>

            {/* Right Action Section: Alerts, Tour, Report, Auth */}
            <div className="flex items-center space-x-2">
              {/* KPI Safety Alerts Notification System */}
              <AlertsNotificationDropdown
                cancellationRate={cancellationRate}
                supportTickets={supportTickets}
                deliveryTime={deliveryTime}
                repeatRate={repeatRate}
                unusedCouponRate={unusedCouponRate}
                onNavigateTab={onNavigateTab}
              />

              {/* Presentation Mode / Competition Tour */}
              <button
                onClick={onOpenTour}
                className="inline-flex items-center px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:brightness-110 text-white shadow-lg shadow-indigo-500/20 transition"
                title="10-Step Startup Competition Tour"
              >
                <Compass className="w-3.5 h-3.5 sm:mr-1.5 animate-spin-slow" />
                <span className="hidden sm:inline">Presentation Tour</span>
                <span className="sm:hidden">Tour</span>
              </button>

              {/* Executive Impact Report (Desktop) */}
              <button
                onClick={onOpenReport}
                className="hidden xl:inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>Impact Report</span>
              </button>

              {/* User Account / Role Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1.5 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                    {currentUser?.displayName?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#17213A] border border-slate-800 shadow-2xl p-3 z-50 text-xs space-y-2 animate-in fade-in">
                    <div className="pb-2 border-b border-slate-800">
                      <p className="font-bold text-white truncate">{currentUser?.displayName || 'Demo User'}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'No email'}</p>
                      <span className="mt-1 inline-block text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold uppercase">
                        Role: {currentEnvironment}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Demo Persona Switch
                      </span>
                      <button
                        onClick={() => {
                          enableDemoUser('customer' as any);
                          onSwitchEnvironment('customer');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        🛍️ Priya Sharma (Customer - Madhapur)
                      </button>
                      <button
                        onClick={() => {
                          enableDemoUser('store_partner' as any);
                          onSwitchEnvironment('retailer');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        🏪 Ramesh Patel (Retailer - Balaji Store)
                      </button>
                      <button
                        onClick={() => {
                          enableDemoUser('admin');
                          onSwitchEnvironment('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                      >
                        🏛️ Executive Lead (Admin Command)
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between">
                      {currentUser?.isDemo ? (
                        <button
                          onClick={() => {
                            signInWithGoogle();
                            setShowUserMenu(false);
                          }}
                          className="text-[11px] text-indigo-400 hover:underline flex items-center"
                        >
                          <LogIn className="w-3 h-3 mr-1" />
                          <span>Google Sign In</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            logOut();
                            setShowUserMenu(false);
                          }}
                          className="text-[11px] text-rose-400 hover:underline flex items-center"
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
