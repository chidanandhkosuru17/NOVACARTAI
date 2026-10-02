import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  HeadphonesIcon,
  Flame,
  XCircle,
  Repeat,
} from 'lucide-react';
import { TabKey } from './Sidebar';

export interface AlertThresholds {
  cancellationRateMax: number; // e.g. 7.0%
  supportTicketsMax: number;    // e.g. 4000
  deliveryTimeMax: number;     // e.g. 30 mins
  repeatRateMin: number;       // e.g. 35.0%
  couponWasteMax: number;      // e.g. 30.0%
}

interface AlertsNotificationDropdownProps {
  cancellationRate: number;
  supportTickets: number;
  deliveryTime: number;
  repeatRate: number;
  unusedCouponRate: number;
  onNavigateTab: (tab: TabKey) => void;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  cancellationRateMax: 7.0,
  supportTicketsMax: 4000,
  deliveryTimeMax: 30.0,
  repeatRateMin: 35.0,
  couponWasteMax: 30.0,
};

export const AlertsNotificationDropdown: React.FC<AlertsNotificationDropdownProps> = ({
  cancellationRate,
  supportTickets,
  deliveryTime,
  repeatRate,
  unusedCouponRate,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>(() => {
    const saved = localStorage.getItem('novacart_alert_thresholds');
    return saved ? JSON.parse(saved) : DEFAULT_THRESHOLDS;
  });
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Save thresholds to localStorage
  useEffect(() => {
    localStorage.setItem('novacart_alert_thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  // Click away listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsConfigOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Evaluate dynamic alerts based on thresholds
  const rawAlerts = [
    {
      id: 'alert-cancellation',
      isTriggered: cancellationRate > thresholds.cancellationRateMax,
      severity: 'critical' as const,
      title: 'Order Cancellation Rate Spike',
      kpiName: 'Cancellation Rate',
      currentValue: `${cancellationRate}%`,
      thresholdValue: `≤ ${thresholds.cancellationRateMax}%`,
      delta: `+${(cancellationRate - thresholds.cancellationRateMax).toFixed(1)}% above safe limit`,
      description:
        'Cancellations have breached safety tolerance. 62% of lost orders originate from out-of-stock items at partner Kiranas.',
      targetTab: 'order_rescue' as TabKey,
      actionLabel: 'Launch Order Rescue',
      icon: XCircle,
      color: 'rose',
    },
    {
      id: 'alert-tickets',
      isTriggered: supportTickets > thresholds.supportTicketsMax,
      severity: 'critical' as const,
      title: 'Support Desk Ticket Influx',
      kpiName: 'Monthly Tickets',
      currentValue: `${supportTickets.toLocaleString()} / mo`,
      thresholdValue: `≤ ${thresholds.supportTicketsMax.toLocaleString()} / mo`,
      delta: `+${(supportTickets - thresholds.supportTicketsMax).toLocaleString()} tickets overload`,
      description:
        'Support ticket volume has surged by +90.3%. Average resolution latency reached 9.2 hours due to manual refund processes.',
      targetTab: 'support' as TabKey,
      actionLabel: 'Open Support & Refunds',
      icon: HeadphonesIcon,
      color: 'rose',
    },
    {
      id: 'alert-delivery',
      isTriggered: deliveryTime > thresholds.deliveryTimeMax,
      severity: 'warning' as const,
      title: 'Delivery SLA Latency Breach',
      kpiName: 'Avg Delivery Time',
      currentValue: `${deliveryTime} mins`,
      thresholdValue: `≤ ${thresholds.deliveryTimeMax} mins`,
      delta: `+${(deliveryTime - thresholds.deliveryTimeMax).toFixed(0)}m slower than quick-commerce SLA`,
      description:
        'Average delivery time is 37 mins (was 29m). 13% of orders are delivered >15 minutes late, severely suppressing repeat orders.',
      targetTab: 'order_rescue' as TabKey,
      actionLabel: 'Check Cluster Dispatch',
      icon: Clock,
      color: 'amber',
    },
    {
      id: 'alert-repeat',
      isTriggered: repeatRate < thresholds.repeatRateMin,
      severity: 'warning' as const,
      title: 'Customer Repeat Rate Below Floor',
      kpiName: 'Repeat Purchase Rate',
      currentValue: `${repeatRate}%`,
      thresholdValue: `≥ ${thresholds.repeatRateMin}% floor`,
      delta: `-${(thresholds.repeatRateMin - repeatRate).toFixed(1)}% below required floor`,
      description:
        'Repeat rate dropped to 27% (was 41%). Only 31% place a second order in 30 days without milestone-based gamification.',
      targetTab: 'customer_intelligence' as TabKey,
      actionLabel: 'Deploy 3-Streak Milestone',
      icon: Repeat,
      color: 'amber',
    },
    {
      id: 'alert-coupon-waste',
      isTriggered: unusedCouponRate > thresholds.couponWasteMax,
      severity: 'info' as const,
      title: 'High Marketing Coupon Breakage',
      kpiName: 'Unused Coupon Rate',
      currentValue: `${unusedCouponRate}%`,
      thresholdValue: `≤ ${thresholds.couponWasteMax}%`,
      delta: `+${(unusedCouponRate - thresholds.couponWasteMax).toFixed(0)}% unused capital waste`,
      description:
        '44% of promotional vouchers are expiring unredeemed due to confusing cart restrictions and acquisition-heavy spend.',
      targetTab: 'promotions' as TabKey,
      actionLabel: 'Optimize Campaigns',
      icon: Flame,
      color: 'purple',
    },
  ];

  const activeAlerts = rawAlerts.filter((a) => a.isTriggered);
  const unacknowledgedAlerts = activeAlerts.filter((a) => !acknowledgedIds.includes(a.id));
  const hasCritical = unacknowledgedAlerts.some((a) => a.severity === 'critical');

  const handleAcknowledgeAll = () => {
    setAcknowledgedIds(activeAlerts.map((a) => a.id));
  };

  const handleResetAcknowledge = () => {
    setAcknowledgedIds([]);
  };

  const handleNavigate = (tab: TabKey) => {
    setIsOpen(false);
    setIsConfigOpen(false);
    onNavigateTab(tab);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Alerts Bell Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsConfigOpen(false);
        }}
        className={`relative p-2 rounded-xl border transition-all flex items-center justify-center ${
          unacknowledgedAlerts.length > 0
            ? hasCritical
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 hover:bg-rose-900/60 shadow-lg shadow-rose-950/50'
              : 'bg-amber-950/60 border-amber-500/60 text-amber-300 hover:bg-amber-900/60'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
        }`}
        title="KPI Threshold Safety Alerts"
        aria-label="KPI Threshold Safety Alerts"
      >
        <Bell className={`w-4 h-4 ${hasCritical ? 'animate-bounce text-rose-400' : ''}`} />

        {unacknowledgedAlerts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-black shadow-sm ring-2 ring-slate-900">
            {unacknowledgedAlerts.length}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`p-1.5 rounded-xl ${
                  hasCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>KPI Safety Threshold Alerts</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      unacknowledgedAlerts.length > 0
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {unacknowledgedAlerts.length} Active
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  Automated telemetry against executive risk limits
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsConfigOpen(!isConfigOpen)}
                className={`p-1.5 rounded-lg transition text-slate-400 hover:text-white ${
                  isConfigOpen ? 'bg-slate-800 text-emerald-400' : 'hover:bg-slate-800'
                }`}
                title="Configure Thresholds"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Threshold Configuration Drawer */}
          {isConfigOpen && (
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">
                  Pre-Defined Safety Thresholds
                </span>
                <button
                  onClick={() => setThresholds(DEFAULT_THRESHOLDS)}
                  className="text-[10px] text-emerald-400 hover:underline"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {/* Cancellation Ceiling */}
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Max Cancellation Rate
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Current: {cancellationRate}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="20"
                      value={thresholds.cancellationRateMax}
                      onChange={(e) =>
                        setThresholds({
                          ...thresholds,
                          cancellationRateMax: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-xs text-rose-300"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </div>

                {/* Support Tickets Ceiling */}
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Max Monthly Tickets
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Current: {supportTickets.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="100"
                      min="1000"
                      max="10000"
                      value={thresholds.supportTicketsMax}
                      onChange={(e) =>
                        setThresholds({
                          ...thresholds,
                          supportTicketsMax: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-xs text-rose-300"
                    />
                  </div>
                </div>

                {/* Delivery Time Ceiling */}
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Max Delivery Time
                    </span>
                    <span className="text-[10px] text-slate-500">Current: {deliveryTime}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      min="15"
                      max="60"
                      value={thresholds.deliveryTimeMax}
                      onChange={(e) =>
                        setThresholds({
                          ...thresholds,
                          deliveryTimeMax: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-xs text-amber-300"
                    />
                    <span className="text-[10px] text-slate-400">min</span>
                  </div>
                </div>

                {/* Repeat Rate Floor */}
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Min Repeat Rate Floor
                    </span>
                    <span className="text-[10px] text-slate-500">Current: {repeatRate}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="60"
                      value={thresholds.repeatRateMin}
                      onChange={(e) =>
                        setThresholds({
                          ...thresholds,
                          repeatRateMin: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-14 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-right font-mono text-xs text-emerald-300"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert Cards List */}
          <div className="max-h-[360px] overflow-y-auto p-3 space-y-2.5">
            {activeAlerts.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-white">All KPIs Within Safety Thresholds</p>
                <p className="text-[10px] text-slate-400">
                  Operations are currently running within the configured governance tolerance limits.
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => {
                const Icon = alert.icon;
                const isAcknowledged = acknowledgedIds.includes(alert.id);
                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isAcknowledged
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : alert.severity === 'critical'
                        ? 'bg-rose-950/30 border-rose-800/60 shadow-sm'
                        : 'bg-amber-950/30 border-amber-800/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-2">
                        <div
                          className={`p-1.5 rounded-xl flex-shrink-0 mt-0.5 ${
                            alert.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-white">{alert.title}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                                alert.severity === 'critical'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}
                            >
                              {alert.severity}
                            </span>
                          </div>

                          {/* Value vs Threshold Comparison */}
                          <div className="flex items-center space-x-3 mt-1 text-[10px] font-mono">
                            <span className="text-slate-300 font-bold">
                              Current: <span className="text-white">{alert.currentValue}</span>
                            </span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-400">
                              Limit: <span>{alert.thresholdValue}</span>
                            </span>
                          </div>

                          <p className="text-[10px] text-rose-400 font-semibold mt-0.5">
                            {alert.delta}
                          </p>

                          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[9px] text-slate-500">
                        {isAcknowledged ? 'Acknowledged' : 'Intervention Needed'}
                      </span>
                      <button
                        onClick={() => handleNavigate(alert.targetTab)}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold transition group"
                      >
                        <span>{alert.actionLabel}</span>
                        <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer actions */}
          {activeAlerts.length > 0 && (
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                {activeAlerts.length} threshold breach{activeAlerts.length > 1 ? 'es' : ''} detected
              </span>

              {unacknowledgedAlerts.length > 0 ? (
                <button
                  onClick={handleAcknowledgeAll}
                  className="text-[11px] font-semibold text-slate-300 hover:text-white"
                >
                  Acknowledge All
                </button>
              ) : (
                <button
                  onClick={handleResetAcknowledge}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline"
                >
                  Restore Alerts
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
