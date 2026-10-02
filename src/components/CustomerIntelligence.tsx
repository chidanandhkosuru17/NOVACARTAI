import React, { useState } from 'react';
import {
  Users,
  Award,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  IndianRupee,
  ShoppingBag,
  Send,
  CheckCircle2,
  Filter,
  BarChart2,
  Flame,
} from 'lucide-react';
import { CustomerSegment } from '../types';
import { formatINR, formatINRNumber, formatPercent } from '../utils/formatters';

interface CustomerIntelligenceProps {
  segments: CustomerSegment[];
  onLaunchCampaignForSegment: (segmentName: string, recommendedDiscount: number) => void;
}

export const CustomerIntelligence: React.FC<CustomerIntelligenceProps> = ({
  segments,
  onLaunchCampaignForSegment,
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('seg-4'); // Default to 'At-Risk'
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const selectedSegment = segments.find((s) => s.id === selectedSegmentId) || segments[0];

  const filteredSegments = segments.filter((seg) => {
    if (filterStatus === 'all') return true;
    return seg.retentionStatus.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleLaunchCampaign = () => {
    const defaultDiscount = selectedSegment.id === 'seg-1' ? 20 : selectedSegment.id === 'seg-4' ? 25 : 15;
    onLaunchCampaignForSegment(selectedSegment.name, defaultDiscount);
    setActionSuccessMessage(`Targeted retention workflow triggered for ${selectedSegment.name}!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 3-Order Retention Milestone Highlight Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-100">
              <Award className="w-3.5 h-3.5" />
              <span>THE 3-ORDER RETENTION MILESTONE</span>
            </div>
            <h2 className="text-lg font-black tracking-tight">
              Order #3 Unlocks a 72% Next-Month Retention Probability
            </h2>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Challenge data shows NOVA CART’s biggest leak is between Order 1 and Order 2 (only 31% reorder in 30 days).
              By transitioning marketing budget from upfront acquisition burn to guided 2nd and 3rd order incentives,
              customer lifetime value surges from ₹980 to ₹7,800.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 flex items-center space-x-4 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl font-black text-white">31%</div>
              <div className="text-[10px] text-emerald-200">Order 2 (30 Days)</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-300">72%</div>
              <div className="text-[10px] text-amber-100">Order 3 (Month +1)</div>
            </div>
          </div>
        </div>
      </div>

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {actionSuccessMessage}
        </div>
      )}

      {/* Main Grid: Segments Table & Deep Dive Retention Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Segments List & Filters */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Customer Segments & Cohort Health
              </h3>
              <p className="text-xs text-slate-500">
                120,000 users analyzed across purchase frequency, AOV, and churn risk
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All (7)
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'critical'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-600 hover:text-rose-700'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilterStatus('declining')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'declining'
                    ? 'bg-white text-amber-700 shadow-sm'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Declining
              </button>
              <button
                onClick={() => setFilterStatus('champion')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === 'champion'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Champions
              </button>
            </div>
          </div>

          {/* Interactive Segments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="pb-2.5 pl-2">Segment</th>
                  <th className="pb-2.5">Users</th>
                  <th className="pb-2.5">Freq</th>
                  <th className="pb-2.5">AOV</th>
                  <th className="pb-2.5">Repeat %</th>
                  <th className="pb-2.5">Est. LTV</th>
                  <th className="pb-2.5 pr-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSegments.map((segment) => {
                  const isSelected = segment.id === selectedSegment.id;
                  return (
                    <tr
                      key={segment.id}
                      onClick={() => setSelectedSegmentId(segment.id)}
                      className={`cursor-pointer transition hover:bg-slate-50 ${
                        isSelected
                          ? 'bg-indigo-50/70 font-semibold ring-1 ring-indigo-200 rounded-lg'
                          : ''
                      }`}
                    >
                      <td className="py-3 pl-2">
                        <div className="font-bold text-slate-900">{segment.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                          {segment.id === 'seg-1'
                            ? 'Drop off after order 1'
                            : segment.id === 'seg-6'
                            ? 'Coupons ≥ 30% only'
                            : 'Cohort profile'}
                        </div>
                      </td>
                      <td className="py-3 font-mono font-medium text-slate-700">
                        {formatINRNumber(segment.customerCount)}
                      </td>
                      <td className="py-3 text-slate-600">{segment.orderFrequency}x/mo</td>
                      <td className="py-3 font-mono text-slate-800">₹{segment.averageOrderValue}</td>
                      <td className="py-3">
                        <span
                          className={`font-semibold ${
                            segment.repeatPurchaseRate < 25
                              ? 'text-rose-600'
                              : segment.repeatPurchaseRate < 45
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {segment.repeatPurchaseRate}%
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-900">
                        ₹{segment.estimatedCustomerValue}
                      </td>
                      <td className="py-3 pr-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${
                            segment.retentionStatus === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : segment.retentionStatus === 'Declining'
                              ? 'bg-amber-100 text-amber-800'
                              : segment.retentionStatus === 'Stable'
                              ? 'bg-blue-100 text-blue-800'
                              : segment.retentionStatus === 'High Potential'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {segment.retentionStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            *Click on any segment to inspect customized retention levers and launch targeted promotions.
          </p>
        </div>

        {/* Right Column: Tailored Retention Actions Panel */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  Selected Segment Action Plan
                </span>
                <h3 className="text-base font-black text-slate-900 flex items-center">
                  {selectedSegment.name}
                </h3>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  selectedSegment.retentionStatus === 'Critical'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedSegment.retentionStatus === 'Declining'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {selectedSegment.retentionStatus} Status
              </span>
            </div>

            {/* Segment Profile Metrics */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Cohort Size</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {formatINRNumber(selectedSegment.customerCount)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Repeat Rate</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">
                  {selectedSegment.repeatPurchaseRate}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Average Basket</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  ₹{selectedSegment.averageOrderValue}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Behavioral Diagnostics
              </h4>
              <p className="text-xs text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                {selectedSegment.behaviorDescription}
              </p>
            </div>

            {/* Recommended Turnaround Actions */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                Evidence-Based Retention Actions
              </h4>
              <ul className="space-y-2">
                {selectedSegment.recommendedActions.map((action, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start space-x-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleLaunchCampaign}
              className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition focus:outline-none"
            >
              <Send className="w-3.5 h-3.5 mr-2" />
              Launch Retention Campaign for {selectedSegment.name}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Syncs directly with Module E: Smart Promotions without arbitrary coupon burn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
