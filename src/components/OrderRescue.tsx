import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PhoneCall,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Filter,
  DollarSign,
  Search,
  Check,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { OperationalOrder, OrderStatus, RiskLevel } from '../types';
import { formatINR } from '../utils/formatters';

interface OrderRescueProps {
  orders: OperationalOrder[];
  onUpdateOrders: (orders: OperationalOrder[]) => void;
}

export const OrderRescue: React.FC<OrderRescueProps> = ({
  orders,
  onUpdateOrders,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'risk' | 'delayed' | 'cancelled' | 'rescued'>('risk');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [activeRescueOrderId, setActiveRescueOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalAtRisk = orders.filter((o) => o.riskLevel === 'Critical' || o.riskLevel === 'High').length;
  const totalRescued = orders.filter((o) => o.isRescued).length;
  const totalCancelled = orders.filter((o) => o.status === 'Cancelled').length;

  const filteredOrders = orders.filter((o) => {
    const matchesCity = selectedCity === 'all' || o.city === selectedCity;
    if (!matchesCity) return false;

    if (selectedFilter === 'risk') return o.riskLevel === 'Critical' || o.riskLevel === 'High';
    if (selectedFilter === 'delayed') return o.delayStatus.includes('Delay') || o.delayStatus.includes('Delayed');
    if (selectedFilter === 'cancelled') return o.status === 'Cancelled';
    if (selectedFilter === 'rescued') return o.isRescued;
    return true;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        let newRisk = o.riskLevel;
        if (newStatus === 'Delivered') newRisk = 'Normal';
        if (newStatus === 'Cancelled') newRisk = 'Critical';
        return {
          ...o,
          status: newStatus,
          riskLevel: newRisk,
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    setToastMessage(`Order ${orderId} updated to "${newStatus}"!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTriggerRescueAction = (orderId: string, actionText: string) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          isRescued: true,
          riskLevel: 'Normal' as RiskLevel,
          rescueActionNote: actionText,
          status: o.status === 'Placed' ? ('Confirmed' as OrderStatus) : o.status,
          delayStatus: 'On Time' as OperationalOrder['delayStatus'],
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    setToastMessage(`Intervention executed: ${actionText}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Order Operations Diagnostics */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <Truck className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Order Risk Engine & Delivery Operations Control
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Transparent Operational Detection:</strong> Monitors order lifecycles in real time. Flagging orders when stores exceed 4 minutes to confirm,
              when unassigned riders exceed 6 minutes, or when delivery trajectories risk missing the 35-minute service-level threshold.
            </p>
          </div>

          {/* Rescue Summary Metrics */}
          <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 flex-shrink-0 text-center">
            <div className="px-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Orders at Risk</span>
              <span className="text-xl font-black text-rose-600 font-mono">{totalAtRisk}</span>
              <span className="text-[10px] text-rose-600 font-medium block">Active alerts</span>
            </div>
            <div className="border-x border-slate-200 px-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Rescued Today</span>
              <span className="text-xl font-black text-emerald-600 font-mono">{totalRescued}</span>
              <span className="text-[10px] text-emerald-600 font-medium block">Intervened</span>
            </div>
            <div className="px-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Lost / Cancelled</span>
              <span className="text-xl font-black text-slate-700 font-mono">{totalCancelled}</span>
              <span className="text-[10px] text-slate-500 block">Investigated</span>
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedFilter('risk')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center ${
              selectedFilter === 'risk'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            At Risk Orders ({totalAtRisk})
          </button>
          <button
            onClick={() => setSelectedFilter('delayed')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              selectedFilter === 'delayed'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Delayed Delivery (&gt;15m)
          </button>
          <button
            onClick={() => setSelectedFilter('rescued')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              selectedFilter === 'rescued'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Rescued Orders ({totalRescued})
          </button>
          <button
            onClick={() => setSelectedFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              selectedFilter === 'cancelled'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled ({totalCancelled})
          </button>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              selectedFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Live ({orders.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">City Hub:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="all">All Hubs (Bengaluru, Mumbai, Delhi)</option>
            <option value="Bengaluru">Bengaluru Hub</option>
            <option value="Mumbai">Mumbai Hub</option>
            <option value="Delhi NCR">Delhi NCR Hub</option>
          </select>
        </div>
      </div>

      {/* Orders Operational Stream */}
      <div className="space-y-3.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            No orders match the selected filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isHighRisk = order.riskLevel === 'Critical' || order.riskLevel === 'High';
            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl p-4 border transition shadow-sm ${
                  isHighRisk && !order.isRescued
                    ? 'border-rose-300 ring-1 ring-rose-200/60'
                    : order.isRescued
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                      {order.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">{order.customerName}</span>
                    <span className="text-[11px] text-slate-500">{order.customerPhone}</span>
                    <span className="text-[11px] text-slate-400">• {order.orderTime}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Dropdown */}
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-slate-400 text-[10px] font-semibold uppercase">Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-300'
                            : order.status === 'Out for delivery'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Picked up">Picked up</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <span className="font-mono font-bold text-xs text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      ₹{order.orderValue}
                    </span>
                  </div>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Retail Partner</span>
                    <p className="font-bold text-slate-800">{order.retailerName}</p>
                    <p className="text-[11px] text-slate-500">
                      {order.locality}, {order.city} ({order.category})
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Delivery Timing</span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">
                        Target: {order.estimatedMinutes}m • Elapsed: {order.actualMinutes || order.estimatedMinutes}m
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold inline-block mt-1 ${
                        order.delayStatus === 'On Time'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {order.delayStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Risk Diagnostics</span>
                    {order.isRescued ? (
                      <div className="mt-1 flex items-center text-emerald-700 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                        Rescued: {order.rescueActionNote || 'Intervention confirmed'}
                      </div>
                    ) : order.riskReason ? (
                      <div className="mt-1 flex items-start space-x-1.5 text-rose-700 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <span>{order.riskReason}</span>
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-medium text-xs flex items-center mt-1">
                        <Check className="w-3.5 h-3.5 mr-1" /> Normal dispatch trajectory
                      </span>
                    )}

                    {order.cancellationReason && (
                      <p className="text-[10px] text-rose-600 font-semibold mt-1">
                        Cancellation Cause: {order.cancellationReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Suggested Action & Rescue CTAs (Only if risk or actionable) */}
                {isHighRisk && !order.isRescued && (
                  <div className="mt-2 pt-3 border-t border-rose-100 bg-rose-50/50 -mx-4 -mb-4 p-3 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2 text-rose-800">
                      <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span className="font-semibold">
                        Suggested Rescue: {order.suggestedAction || 'Contact retailer and expedite dispatch.'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          handleTriggerRescueAction(
                            order.id,
                            'Triggered 1-tap store audio alert & dispatched priority backup rider.'
                          )
                        }
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm transition"
                      >
                        Execute 1-Tap Rescue
                      </button>
                      <button
                        onClick={() =>
                          handleTriggerRescueAction(
                            order.id,
                            'Issued proactive ₹50 delay compensation voucher to customer.'
                          )
                        }
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold text-xs transition"
                      >
                        Send ₹50 Delay Credit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
        <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          *Operational Disclaimer: This order rescue module assists support and dispatch teams with early-warning heuristics. It does not claim to prevent every cancellation or guarantee delivery under severe city weather conditions.
        </p>
      </div>
    </div>
  );
};
