import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Copy,
  CheckCircle2,
  X,
  Printer,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Building2,
  Check,
} from 'lucide-react';
import { BaselineMetrics, BudgetInitiative } from '../types';
import { exportToCSV, formatINR, formatINRNumber } from '../utils/formatters';

interface ImpactReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: BaselineMetrics;
  initiatives: BudgetInitiative[];
}

export const ImpactReportModal: React.FC<ImpactReportModalProps> = ({
  isOpen,
  onClose,
  metrics,
  initiatives,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalAllocated = initiatives.reduce((sum, i) => sum + i.allocationLakh, 0);

  const reportRows = [
    {
      Metric: 'Monthly Gross Merchandise Value (GMV)',
      Baseline: '₹26.1 Lakh',
      TurnaroundTarget: '₹34.8 Lakh (+33.3%)',
      DataSource: 'Challenge Doc Seed',
      Status: 'Achievable with 6-Month Plan',
    },
    {
      Metric: 'Monthly Completed Orders',
      Baseline: '38,500 Orders',
      TurnaroundTarget: '48,200 Orders (+25.2%)',
      DataSource: 'Challenge Doc Seed',
      Status: 'Supported by Avoided Cancellations',
    },
    {
      Metric: 'Repeat Purchase Rate',
      Baseline: '27.0% (down from 41%)',
      TurnaroundTarget: '38.0% - 40.0%',
      DataSource: 'Challenge Doc Seed',
      Status: 'Targeting 3-Order 72% Retention Cohort',
    },
    {
      Metric: 'Order Cancellation Rate',
      Baseline: '11.0% (~4,235 orders/mo)',
      TurnaroundTarget: '4.5% (~2,100 orders saved)',
      DataSource: 'Challenge Doc Seed',
      Status: 'WhatsApp 1-Tap Kirana Sync + Auto Masking',
    },
    {
      Metric: 'Average Delivery Time',
      Baseline: '37 Minutes (13% >15m late)',
      TurnaroundTarget: '26 - 28 Minutes (<4% late)',
      DataSource: 'Challenge Doc Seed',
      Status: '1.5km Micro-Cluster Dispatch & Surge Bounties',
    },
    {
      Metric: 'Marketing Expenditure & Waste',
      Baseline: '₹17.0L/mo (44% coupons unused)',
      TurnaroundTarget: '₹14.0L/mo (<15% coupon waste)',
      DataSource: 'Challenge Doc Seed',
      Status: 'Reallocate 68% to Retention; Cap Blanket 50% Promos',
    },
    {
      Metric: 'Customer Support Tickets & SLA',
      Baseline: '5,900 Tickets/mo (9.2h resolution)',
      TurnaroundTarget: '2,400 Tickets/mo (<2.2h resolution)',
      DataSource: 'Challenge Doc Seed',
      Status: 'Automated UPI Instant Refunds + Store Picking Checks',
    },
    {
      Metric: 'Six-Month Turnaround Fund Budget',
      Baseline: '₹0 (Pre-Rescue)',
      TurnaroundTarget: `₹${totalAllocated.toFixed(1)} Lakh (Max ₹25.0 Lakh)`,
      DataSource: 'Proposed Budget Planning Scenario',
      Status: totalAllocated <= 25.0 ? 'Within Ceiling Cap' : 'Exceeds Cap',
    },
  ];

  const handleExportCSV = () => {
    exportToCSV('NOVA_CART_Business_Rescue_Impact_Report', reportRows);
  };

  const handleCopySummary = () => {
    const text = `NOVA CART - BUSINESS RESCUE STRATEGIC AUDIT SUMMARY
Baseline: 38,500 monthly orders | ₹26.1L GMV | 27% repeat rate | 11% cancellations | 37m delivery | ₹17L marketing spend.
Proposed Turnaround: 48,200 orders (+25%) | ₹34.8L GMV (+33%) | 38% repeat rate | 4.5% cancellations | 27m delivery.
Budget Allocation: ₹${totalAllocated.toFixed(1)} Lakh over 6 months within the ₹25 Lakh cap.
Top Interventions: 3-Order Streak Milestone, WhatsApp Kirana 1-Tap Inventory Verification, Dynamic 1.5km Rider Micro-Clustering, Instant UPI Automated Refunds.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  NOVA CART Executive Impact Audit
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  ₹25L PLAN
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Official Business Rescue Evaluation Report • 620 Retailers • 3 Metros
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end space-x-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Summary'}</span>
              <span className="sm:hidden">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 sm:mr-1" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Key Comparisons Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Performance Metric</th>
                  <th className="py-3 px-4">Baseline (Challenge Data)</th>
                  <th className="py-3 px-4 text-indigo-700">6-Month Target</th>
                  <th className="py-3 px-4">Turnaround Lever / Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.Metric}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">{row.Baseline}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">{row.TurnaroundTarget}</td>
                    <td className="py-3 px-4 text-slate-600">{row.Status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Strategic Pillars & Risk Mitigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center text-xs">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                Key Strategic Implementation Pillars
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside">
                <li>
                  <strong>Retention 3-Streak:</strong> Bridging the drop-off after order 1 (72% repeat rate on order 3).
                </li>
                <li>
                  <strong>Kirana 1-Tap WhatsApp Sync:</strong> Auto-masking stale stock to eliminate ghost checkout cancellations.
                </li>
                <li>
                  <strong>Micro-Cluster Dispatch:</strong> Dynamic batching within 1.5 km radii to reduce delivery from 37m to &lt;28m.
                </li>
                <li>
                  <strong>Instant UPI Refunds:</strong> Webhooks to process payments on store rejections within 5 minutes.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center text-xs">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-700" />
                Operational Risks & Governance Safeguards
              </h4>
              <ul className="space-y-1.5 text-[11px] text-amber-800 list-disc list-inside">
                <li>
                  <strong>Store Churn Risk:</strong> Mitigate by protecting local retailer margins and limiting heavy discount burn.
                </li>
                <li>
                  <strong>Budget Discipline:</strong> Enforce strict ₹25 Lakh maximum cap with ₹4L reserve buffer for operational testing.
                </li>
                <li>
                  <strong>Monsoon Weather SLA:</strong> Rider dynamic bounty surge (+₹20) during adverse city traffic conditions.
                </li>
                <li>
                  <strong>Coupons Leakage:</strong> Transition to minimum cart thresholds (₹500+) rather than unconditional vouchers.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
          <span>NOVA CART Business Rescue Platform • Confidential Executive Audit</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
