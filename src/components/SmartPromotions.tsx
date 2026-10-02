import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Percent,
  TrendingUp,
  Sliders,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Info,
  Calendar,
} from 'lucide-react';
import { Campaign } from '../types';
import { formatINR, formatINRNumber, formatPercent } from '../utils/formatters';

interface SmartPromotionsProps {
  campaigns: Campaign[];
  onUpdateCampaigns: (campaigns: Campaign[]) => void;
  prefillSegment?: string;
  prefillDiscount?: number;
}

export const SmartPromotions: React.FC<SmartPromotionsProps> = ({
  campaigns,
  onUpdateCampaigns,
  prefillSegment,
  prefillDiscount,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Campaign simulator sliders
  // Baseline: ₹17 Lakh monthly spend with 58% on acquisition, 42% on retention
  const [simTotalBudgetLakh, setSimTotalBudgetLakh] = useState<number>(14.0); // e.g. trimmed to 14L
  const [simRetentionSharePct, setSimRetentionSharePct] = useState<number>(65); // shift from 42% to 65%
  const [simAvgDiscountPct, setSimAvgDiscountPct] = useState<number>(20); // shift from 50% blanket to 20% milestone

  // Form State for new campaign
  const [newCampaignName, setNewCampaignName] = useState('Weekend Kirana Basket Bonus');
  const [newCampaignType, setNewCampaignType] = useState<Campaign['type']>(
    prefillSegment ? 'Repeat purchase reward' : 'Repeat purchase reward'
  );
  const [newTargetSegment, setNewTargetSegment] = useState<string>(prefillSegment || 'New Customers');
  const [newBudget, setNewBudget] = useState<number>(150000);
  const [newDiscountPct, setNewDiscountPct] = useState<number>(prefillDiscount || 20);

  // Compute Simulator Projections
  // Acquisition budget in INR
  const totalBudgetINR = simTotalBudgetLakh * 100000;
  const retentionBudgetINR = (totalBudgetINR * simRetentionSharePct) / 100;
  const acquisitionBudgetINR = totalBudgetINR - retentionBudgetINR;

  // Realistic turnaround formulas
  // Lower discount + higher retention allocation improves coupon redemption from 56% to ~82%
  const projectedRedemptionRate = Math.min(88, Math.max(50, 56 + (simRetentionSharePct - 42) * 0.6 - (simAvgDiscountPct - 25) * 0.4));
  const estimatedUnusedWasteRate = 100 - projectedRedemptionRate;

  // Estimated orders: retention spend produces higher order repeat velocity
  const ordersFromAcq = Math.round(acquisitionBudgetINR / (simAvgDiscountPct * 8 + 120));
  const ordersFromRetention = Math.round(retentionBudgetINR / (simAvgDiscountPct * 4 + 60));
  const totalProjectedOrders = ordersFromAcq + ordersFromRetention;

  // Blended AOV increases when moving away from heavy discounts
  const estimatedAOV = Math.round(486 + (35 - simAvgDiscountPct) * 4);
  const estimatedGrossRevenue = totalProjectedOrders * estimatedAOV;
  const estimatedCAC = ordersFromAcq > 0 ? Math.round(acquisitionBudgetINR / (ordersFromAcq * 0.7)) : 0;
  const projectedROAS = totalBudgetINR > 0 ? (estimatedGrossRevenue / totalBudgetINR).toFixed(2) : '0';

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const created: Campaign = {
      id: `cmp-${Date.now()}`,
      name: newCampaignName.trim(),
      type: newCampaignType,
      targetSegment: newTargetSegment,
      budget: Number(newBudget),
      discountPct: Number(newDiscountPct),
      status: 'Active',
      ordersGenerated: 0,
      revenueGenerated: 0,
      redemptionRate: 75,
      estimatedRoi: 3.4,
    };

    onUpdateCampaigns([created, ...campaigns]);
    setIsCreateModalOpen(false);
    setToastMessage(`Campaign "${created.name}" launched successfully!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleCampaignStatus = (id: string) => {
    const updated = campaigns.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          status: c.status === 'Active' ? ('Paused' as Campaign['status']) : ('Active' as Campaign['status']),
        };
      }
      return c;
    });
    onUpdateCampaigns(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Marketing Wastage Problem Diagnostics */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <Flame className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Smart Promotions & Retention Budget Optimization
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Challenge Diagnosis:</strong> NOVA CART currently spends ₹17 Lakh/month with 58% allocated to upfront customer acquisition discounts.
              44% of coupons are unused, and customers acquired through heavy blanket discounts show the weakest 30-day retention.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200 flex-shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Monthly Spend</div>
              <div className="text-xl font-black text-slate-900">₹17.0 Lakh</div>
              <div className="text-[10px] text-rose-600 font-medium">44% coupon waste rate</div>
            </div>
            <div className="w-px h-8 bg-slate-300" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Acquisition vs Retention</div>
              <div className="text-sm font-bold text-slate-800">58% / 42%</div>
              <div className="text-[10px] text-indigo-600 font-medium">Rebalancing required</div>
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

      {/* Campaign Budget Allocation Simulator */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 p-5 rounded-2xl text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Interactive Marketing Reallocation Simulator
            </span>
            <h3 className="text-base font-black text-white">
              Simulate Spend Shift from Acquisition Burn to Repeat Retention
            </h3>
          </div>
          <span className="text-[11px] bg-white/10 px-3 py-1 rounded-full text-indigo-200 font-medium">
            Illustrative Turnaround Projections
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders Controls */}
          <div className="lg:col-span-6 space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
            {/* Monthly Budget Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>Proposed Total Monthly Spend</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ₹{simTotalBudgetLakh.toFixed(1)} Lakh{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({simTotalBudgetLakh < 17 ? `-₹${(17 - simTotalBudgetLakh).toFixed(1)}L savings` : 'Expanded'})
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="20"
                step="0.5"
                value={simTotalBudgetLakh}
                onChange={(e) => setSimTotalBudgetLakh(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹8 Lakh (Lean)</span>
                <span>Current: ₹17 Lakh</span>
                <span>₹20 Lakh</span>
              </div>
            </div>

            {/* Retention Share Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>Retention & 3-Order Streak Share</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {simRetentionSharePct}% Retention / {100 - simRetentionSharePct}% Acquisition
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="5"
                value={simRetentionSharePct}
                onChange={(e) => setSimRetentionSharePct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>30% (Acquisition Heavy)</span>
                <span>Current: 42%</span>
                <span>85% (Retention First)</span>
              </div>
            </div>

            {/* Average Discount % Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span>Average Promo Incentive</span>
                <span className="font-mono text-amber-300 font-bold">
                  {simAvgDiscountPct}% Off Cart
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={simAvgDiscountPct}
                onChange={(e) => setSimAvgDiscountPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>10% (Targeted Cashback)</span>
                <span>20% (Milestone Bonus)</span>
                <span>50% (Indiscriminate Burn)</span>
              </div>
            </div>
          </div>

          {/* Simulator Projected Outputs */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3">
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 block">Projected Monthly Orders</span>
              <span className="text-xl font-black text-white font-mono">
                {formatINRNumber(totalProjectedOrders)}
              </span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">
                From targeted campaigns
              </span>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 block">Est. Revenue Generated</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatINR(estimatedGrossRevenue)}
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                Est. AOV: ₹{estimatedAOV}
              </span>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 block">Coupon Redemption Rate</span>
              <span className="text-xl font-black text-indigo-300 font-mono">
                {projectedRedemptionRate.toFixed(0)}%
              </span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">
                Waste down to {estimatedUnusedWasteRate.toFixed(0)}% (was 44%)
              </span>
            </div>

            <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
              <span className="text-[10px] text-slate-300 block">Projected Marketing ROAS</span>
              <span className="text-xl font-black text-amber-300 font-mono">
                {projectedROAS}x
              </span>
              <span className="text-[10px] text-slate-300 block mt-0.5">
                Blended CAC: ₹{estimatedCAC}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Management List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Active Marketing Campaigns & Incentives
            </h3>
            <p className="text-xs text-slate-500">
              Portfolio of ongoing promotions targeting specific customer segments
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Campaign
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Campaign & Type</th>
                <th className="py-3 px-3">Target Segment</th>
                <th className="py-3 px-3">Budget</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Orders</th>
                <th className="py-3 px-3">Revenue (₹)</th>
                <th className="py-3 px-3">Redemption</th>
                <th className="py-3 px-3">Est. ROI</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-indigo-600 font-medium">{c.type}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.targetSegment}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    {formatINR(c.budget)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-rose-600">{c.discountPct}% off</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{formatINRNumber(c.ordersGenerated)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    {formatINR(c.revenueGenerated)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-slate-800">{c.redemptionRate}%</span>
                      {c.redemptionRate < 60 && (
                        <span className="text-[10px] text-amber-600 font-medium">High Breakage</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-indigo-600 font-mono">{c.estimatedRoi}x</td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleToggleCampaignStatus(c.id)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition ${
                        c.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Launch Smart Campaign
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Strategy Type
                </label>
                <select
                  value={newCampaignType}
                  onChange={(e) => setNewCampaignType(e.target.value as Campaign['type'])}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Repeat purchase reward">Repeat purchase reward (3-Order Streak)</option>
                  <option value="First-order offer">First-order offer</option>
                  <option value="Lapsed customer reactivation">Lapsed customer reactivation</option>
                  <option value="Nearby retailer promotion">Nearby retailer promotion</option>
                  <option value="Category-based promotion">Category-based promotion</option>
                  <option value="Referral campaign">Referral campaign</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Customer Cohort
                </label>
                <select
                  value={newTargetSegment}
                  onChange={(e) => setNewTargetSegment(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="New Customers">New Customers</option>
                  <option value="Active Customers">Active Customers</option>
                  <option value="At-Risk Customers">At-Risk Customers</option>
                  <option value="Multi-Category Shoppers">Multi-Category Shoppers</option>
                  <option value="Repeat Champions">Repeat Champions</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount / Bonus (%)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={newDiscountPct}
                    onChange={(e) => setNewDiscountPct(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
