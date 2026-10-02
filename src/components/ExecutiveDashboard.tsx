import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  ShoppingBag,
  IndianRupee,
  Repeat,
  XCircle,
  Clock,
  Megaphone,
  HeadphonesIcon,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Store,
  ChevronRight,
  Info,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BaselineMetrics } from '../types';
import { formatINR, formatINRNumber, formatPercent, exportToCSV } from '../utils/formatters';
import { TabKey } from './Sidebar';

interface ExecutiveDashboardProps {
  metrics: BaselineMetrics;
  onNavigateTab: (tab: TabKey) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  metrics,
  onNavigateTab,
}) => {
  const [trendView, setTrendView] = useState<'financials' | 'operations' | 'marketing'>('financials');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Realistic 6-month historical trend data showing business trajectory from challenge document
  const trendData = [
    { month: 'Month -5', revenue: 21.5, orders: 32000, repeatRate: 41, cancellationRate: 6.0, deliveryMins: 29, marketingSpend: 11.0, supportTickets: 3100 },
    { month: 'Month -4', revenue: 23.2, orders: 34500, repeatRate: 38, cancellationRate: 7.2, deliveryMins: 31, marketingSpend: 13.5, supportTickets: 3600 },
    { month: 'Month -3', revenue: 24.8, orders: 36200, repeatRate: 34, cancellationRate: 8.5, deliveryMins: 33, marketingSpend: 15.0, supportTickets: 4200 },
    { month: 'Month -2', revenue: 25.5, orders: 37400, repeatRate: 31, cancellationRate: 9.8, deliveryMins: 35, marketingSpend: 16.2, supportTickets: 4900 },
    { month: 'Month -1', revenue: 25.9, orders: 38100, repeatRate: 29, cancellationRate: 10.4, deliveryMins: 36, marketingSpend: 16.8, supportTickets: 5400 },
    { month: 'Current', revenue: 26.1, orders: 38500, repeatRate: 27, cancellationRate: 11.0, deliveryMins: 37, marketingSpend: 17.0, supportTickets: 5900 },
  ];

  // CSV Export for Executive Performance Metrics
  const handleExportPerformanceCSV = () => {
    const exportData = [
      {
        Category: 'Financial Performance',
        Metric: 'Monthly Gross Merchandise Value (GMV)',
        Current_Value: `₹${(metrics.monthlyRevenue / 100000).toFixed(2)} Lakh`,
        Prior_Baseline: '₹21.50 Lakh',
        Delta: '+21.4% increase',
        Operational_Status: 'Growth with severe margin pressure',
        Diagnostic_Notes: 'Monthly GMV reached ₹26.1L across 38,500 orders, but driven heavily by discount burn.',
      },
      {
        Category: 'Financial Performance',
        Metric: 'Average Order Value (AOV)',
        Current_Value: `₹${metrics.averageOrderValue}`,
        Prior_Baseline: '₹475',
        Delta: '+2.3%',
        Operational_Status: 'Stable',
        Diagnostic_Notes: 'Target ₹535+ through multi-store neighborhood Kirana bundles.',
      },
      {
        Category: 'Customer Retention',
        Metric: 'Repeat Purchase Rate',
        Current_Value: `${metrics.repeatPurchaseRate}%`,
        Prior_Baseline: `${metrics.priorRepeatPurchaseRate}%`,
        Delta: '-14.0% drop',
        Operational_Status: 'Critical Churn Alert',
        Diagnostic_Notes: 'Only 31% order again in 30 days. Reaching Order #3 yields 72% repeat probability.',
      },
      {
        Category: 'Operational Fulfillment',
        Metric: 'Order Cancellation Rate',
        Current_Value: `${metrics.cancellationRate}%`,
        Prior_Baseline: `${metrics.priorCancellationRate}%`,
        Delta: '+5.0% increase',
        Operational_Status: 'Severe Operational Leak',
        Diagnostic_Notes: '~4,235 orders cancelled monthly; 62% driven by out-of-stock items and busy-hour store rejections.',
      },
      {
        Category: 'Logistics & Dispatch',
        Metric: 'Average Delivery Time',
        Current_Value: `${metrics.averageDeliveryTime} mins`,
        Prior_Baseline: `${metrics.priorDeliveryTime} mins`,
        Delta: '+8 mins slower',
        Operational_Status: 'SLA Deterioration',
        Diagnostic_Notes: '13% of orders are delivered >15 minutes late; impacts repeat order propensity by 2.4x.',
      },
      {
        Category: 'Marketing Efficiency',
        Metric: 'Monthly Marketing Expenditure',
        Current_Value: `₹${(metrics.marketingSpend / 100000).toFixed(2)} Lakh`,
        Prior_Baseline: '₹11.00 Lakh',
        Delta: '+54.5% burn increase',
        Operational_Status: 'Capital Inefficiency',
        Diagnostic_Notes: 'Represents 65.1% of revenue; 58% spent on customer acquisition with low retention.',
      },
      {
        Category: 'Marketing Efficiency',
        Metric: 'Unused Coupon Rate',
        Current_Value: `${metrics.unusedCouponRate}%`,
        Prior_Baseline: '22%',
        Delta: '+22.0% waste surge',
        Operational_Status: 'Severe Coupon Breakage',
        Diagnostic_Notes: '44% of promotional vouchers expire unredeemed due to confusing cart restrictions.',
      },
      {
        Category: 'Customer Experience',
        Metric: 'Monthly Customer Support Tickets',
        Current_Value: `${metrics.monthlySupportTickets}`,
        Prior_Baseline: `${metrics.priorSupportTickets}`,
        Delta: '+90.3% ticket surge',
        Operational_Status: 'Support Desk Congestion',
        Diagnostic_Notes: 'Refunds (28%) and delivery delays (34%) drive 62% of complaint volume.',
      },
      {
        Category: 'Customer Experience',
        Metric: 'Average Ticket Resolution Latency',
        Current_Value: `${metrics.averageResolutionHours} hours`,
        Prior_Baseline: '3.2 hours',
        Delta: '+6.0 hours latency',
        Operational_Status: 'High Friction',
        Diagnostic_Notes: 'Target sub-2 hours via instant UPI refund webhooks on store rejection.',
      },
      {
        Category: 'Partner Network',
        Metric: 'Active Local Retailers',
        Current_Value: `${metrics.activeRetailers}`,
        Prior_Baseline: '580',
        Delta: '+40 stores onboarded',
        Operational_Status: 'Merchant Churn Risk',
        Diagnostic_Notes: '620 stores across Bengaluru, Mumbai, Delhi NCR (Grocery, Pharmacy, Bakery, Stationery).',
      },
      {
        Category: 'User Growth',
        Metric: 'Total Registered Users',
        Current_Value: `${metrics.totalUsers}`,
        Prior_Baseline: '95,000',
        Delta: '+26.3% growth',
        Operational_Status: 'Top of Funnel Expansion',
        Diagnostic_Notes: '120,000 registered users with 46,000 Monthly Active Users (MAU).',
      },
      {
        Category: 'Turnaround Capital',
        Metric: 'Six-Month Rescue Budget Ceiling',
        Current_Value: '₹25.0 Lakh',
        Prior_Baseline: '₹0 (Pre-Rescue)',
        Delta: 'Dedicated Capital Fund',
        Operational_Status: 'Allocated Across 6 Turnaround Pillars',
        Diagnostic_Notes: 'Strict ₹25L cap covering Kirana sync, retention CRM, dispatch, support and marketing optimization.',
      },
    ];

    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCSV(`NOVA_CART_Executive_Performance_Metrics_${dateStr}`, exportData);
    setToastMessage('Executive performance metrics exported to CSV successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportTrendCSV = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const trendExport = trendData.map((t) => ({
      Month: t.month,
      Gross_Revenue_Lakh_INR: t.revenue,
      Completed_Orders: t.orders,
      Repeat_Purchase_Rate_Pct: t.repeatRate,
      Cancellation_Rate_Pct: t.cancellationRate,
      Average_Delivery_Minutes: t.deliveryMins,
      Marketing_Expenditure_Lakh_INR: t.marketingSpend,
      Support_Tickets_Volume: t.supportTickets,
    }));
    exportToCSV(`NOVA_CART_Historical_6Month_Trends_${dateStr}`, trendExport);
    setToastMessage('Historical 6-month trends exported to CSV!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Turnaround Urgent Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                NOVA CART Business Rescue Challenge Diagnostics Active
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Gross order volume is growing (+20% in 5 months), but critical health indicators signal acute operational distress:
                Repeat rate plummeted from <strong className="text-rose-700">41% to 27%</strong>, cancellations doubled to{' '}
                <strong className="text-rose-700">11%</strong>, and monthly marketing burn reached{' '}
                <strong className="text-slate-900">₹17 Lakh</strong> with 44% unused coupon waste.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleExportPerformanceCSV}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm whitespace-nowrap"
              title="Download full executive metrics CSV for offline analysis"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export CSV
            </button>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm whitespace-nowrap"
            >
              Launch Simulator
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Comparison Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* Monthly Revenue */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium mb-1">
            <span>Monthly GMV</span>
            <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {formatINR(metrics.monthlyRevenue)}
          </div>
          <div className="flex items-center text-[10px] sm:text-[11px] text-slate-500 mt-1.5 space-x-1">
            <span className="text-emerald-600 font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +21.4%
            </span>
            <span className="hidden sm:inline">vs 5 mos ago (₹21.5L)</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-slate-400 truncate">
            AOV ₹{metrics.averageOrderValue} • 38.5k orders
          </div>
        </div>

        {/* Repeat Purchase Rate */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-rose-200 shadow-sm relative overflow-hidden bg-gradient-to-b from-white to-rose-50/20">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium mb-1">
            <span>Repeat Rate</span>
            <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-700">
            {metrics.repeatPurchaseRate}%
          </div>
          <div className="flex items-center text-[10px] sm:text-[11px] text-rose-600 font-semibold mt-1.5 space-x-1">
            <TrendingDown className="w-3 h-3 mr-0.5" />
            <span>-14.0%</span>
            <span className="text-slate-500 font-normal">(was 41%)</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-rose-600 font-medium truncate">
            Only 31% order #2 in 30d
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-rose-200 shadow-sm relative overflow-hidden bg-gradient-to-b from-white to-rose-50/20">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium mb-1">
            <span>Cancellations</span>
            <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-700">
            {metrics.cancellationRate}%
          </div>
          <div className="flex items-center text-[10px] sm:text-[11px] text-rose-600 font-semibold mt-1.5 space-x-1">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            <span>+5.0%</span>
            <span className="text-slate-500 font-normal">(was 6%)</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-slate-500 truncate">
            ~4,235 lost/mo
          </div>
        </div>

        {/* Delivery Time */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium mb-1">
            <span>Avg Delivery</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-800">
            {metrics.averageDeliveryTime}m
          </div>
          <div className="flex items-center text-[10px] sm:text-[11px] text-amber-600 font-semibold mt-1.5 space-x-1">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            <span>+8 mins</span>
            <span className="text-slate-500 font-normal">(was 29m)</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-slate-500 truncate">
            13% &gt;15 mins late
          </div>
        </div>

        {/* Marketing Spend */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-medium mb-1">
            <span>Marketing Burn</span>
            <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {formatINR(metrics.marketingSpend)}
          </div>
          <div className="flex items-center text-[10px] sm:text-[11px] text-slate-500 mt-1.5 space-x-1">
            <span className="font-semibold text-rose-600">65.1%</span>
            <span>of monthly GMV</span>
          </div>
          <div className="mt-1 text-[9px] sm:text-[10px] text-amber-600 font-medium truncate">
            44% coupons unused
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-semibold">User Base</p>
            <p className="text-base font-bold text-slate-900">
              {formatINRNumber(metrics.totalUsers)} Registered
            </p>
            <p className="text-[11px] text-slate-500">{formatINRNumber(metrics.monthlyActiveUsers)} Monthly Active (MAU)</p>
          </div>
          <Users className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Partner Network</p>
            <p className="text-base font-bold text-slate-900">
              {metrics.activeRetailers} Local Retailers
            </p>
            <p className="text-[11px] text-slate-500">Bengaluru • Mumbai • Delhi NCR</p>
          </div>
          <Store className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Support Tickets</p>
            <p className="text-base font-bold text-rose-700">
              {formatINRNumber(metrics.monthlySupportTickets)} / Month
            </p>
            <p className="text-[11px] text-rose-600 font-medium">+90.3% surge (was 3,100)</p>
          </div>
          <HeadphonesIcon className="w-6 h-6 text-rose-400" />
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Ticket Resolution</p>
            <p className="text-base font-bold text-slate-900">
              {metrics.averageResolutionHours} Hours Avg
            </p>
            <p className="text-[11px] text-slate-500">Major: Refunds & Delays</p>
          </div>
          <Clock className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Business Performance & Turnaround Indicators
            </h3>
            <p className="text-xs text-slate-500">
              Comparing earlier 6-month historical baseline against current operations
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setTrendView('financials')}
              className={`px-3 py-1.5 rounded-lg transition ${
                trendView === 'financials'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Revenue vs Marketing Burn
            </button>
            <button
              onClick={() => setTrendView('operations')}
              className={`px-3 py-1.5 rounded-lg transition ${
                trendView === 'operations'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Repeat % vs Cancellation %
            </button>
            <button
              onClick={() => setTrendView('marketing')}
              className={`px-3 py-1.5 rounded-lg transition ${
                trendView === 'marketing'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivery Time & Support Volume
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />
            <button
              onClick={handleExportTrendCSV}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition shadow-xs whitespace-nowrap flex-shrink-0"
              title="Download historical monthly time-series metrics CSV"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              <span>Export Trends CSV</span>
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {trendView === 'financials' ? (
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMkt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `₹${val}L`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `₹${value} Lakh`,
                    name === 'revenue' ? 'Monthly Revenue' : 'Marketing Spend',
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Monthly Revenue (₹ Lakh)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="marketingSpend"
                  name="Marketing Spend (₹ Lakh)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorMkt)"
                />
              </AreaChart>
            ) : trendView === 'operations' ? (
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 45]}
                />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'repeatRate' ? 'Repeat Purchase Rate' : 'Cancellation Rate',
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="repeatRate"
                  name="Repeat Purchase Rate (%)"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="cancellationRate"
                  name="Cancellation Rate (%)"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}m`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="deliveryMins"
                  name="Avg Delivery Time (Minutes)"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="supportTickets"
                  name="Support Tickets Count"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Business Health Matrix (Management Attention Required) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Business Health & Operational Red Flags
              </h3>
              <p className="text-xs text-slate-500">
                Pillars requiring immediate intervention under ₹25L turnaround budget
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 bg-rose-100 text-rose-800 font-bold rounded-full">
              4 Critical Flags
            </span>
          </div>

          <div className="space-y-3">
            {/* Health Item 1 */}
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Repeat Purchase Collapse: 41% → 27%
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Only 31% order again in 30 days. Customers reaching 3 orders have 72% repeat probability, but onboarding drop-off is severe.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('customer_intelligence')}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center ml-2 whitespace-nowrap"
              >
                Inspect Cohorts <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Health Item 2 */}
            <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Cancellations Doubled to 11% (~4,235/mo)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Driven by inventory mismatches, retailer busy-hour rejections, and rider availability.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('order_rescue')}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center ml-2 whitespace-nowrap"
              >
                Rescue Orders <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Health Item 3 */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Delivery Speed Deterioration: 29m → 37m
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    13% delivered &gt;15 min late; merchant prep delays and uncoordinated rider dispatch.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center ml-2 whitespace-nowrap"
              >
                Store Tools <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            {/* Health Item 4 */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Marketing Inefficiency: 44% Unused Coupons
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    ₹17L monthly burn; 58% on new acquisition with low LTV; heavy discount-dependency.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('promotions')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 flex items-center ml-2 whitespace-nowrap"
              >
                Reallocate <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Executive Actionable Insights Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  Executive Recommendations Panel
                </h3>
                <p className="text-xs text-slate-500">
                  Evidence-based hypotheses and strategic turnaround proposals
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                Hypotheses Only
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2" />
                  1. Bridge the 2nd & 3rd Order Retention Chasm
                </div>
                <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                  <strong>Recommendation:</strong> Replace blanket first-order 50% vouchers with a structured "3-Order Streak" program. Data proves reaching order 3 yields a 72% next-month repeat rate.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-2" />
                  2. 1-Tap Kirana Stock Confirmation via WhatsApp
                </div>
                <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                  <strong>Recommendation:</strong> Reduce retailer friction with low-tech WhatsApp sync. Auto-mask items unverified for &gt;24 hours to prevent customer checkout on ghost inventory.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-2" />
                  3. Automated UPI Refund & Delay Compensation
                </div>
                <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                  <strong>Recommendation:</strong> Cut ticket resolution from 9.2 hrs to under 2 hrs by auto-triggering UPI refunds immediately upon verified merchant rejection.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">
              6-Month Rescue Budget: <strong>₹25 Lakh</strong>
            </span>
            <button
              onClick={() => onNavigateTab('action_plan')}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
            >
              View 6-Month Action Plan <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
