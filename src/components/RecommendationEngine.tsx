import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Info,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { BusinessRecommendation } from '../types';
import { TabKey } from './Sidebar';

interface RecommendationEngineProps {
  recommendations: BusinessRecommendation[];
  onNavigateTab: (tab: TabKey) => void;
}

export const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  recommendations,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredRecs = recommendations.filter((rec) => {
    const matchesCat = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesPri = selectedPriority === 'all' || rec.priority.toLowerCase() === selectedPriority.toLowerCase();
    return matchesCat && matchesPri;
  });

  const getRouteForCategory = (cat: BusinessRecommendation['category']): TabKey => {
    switch (cat) {
      case 'Retention':
        return 'customer_intelligence';
      case 'Operations':
        return 'order_rescue';
      case 'Inventory':
        return 'inventory';
      case 'Marketing':
        return 'promotions';
      case 'Support':
        return 'support';
      default:
        return 'simulator';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Explainable Business Recommendation Engine
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Transparent Algorithmic Auditing:</strong> Inspects live operational metrics across NOVA CART and triggers prioritized turnaround hypotheses.
              Each recommendation includes verifiable metrics, targeted actions, priority levels, and underlying causal reasoning.
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center flex-shrink-0">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Recommendations</span>
            <span className="text-xl font-black text-indigo-700 font-mono">{recommendations.length} Detected</span>
            <span className="text-[10px] text-slate-400 block">System-generated suggestions</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Domain:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="all">All Domains ({recommendations.length})</option>
            <option value="Retention">Customer Retention</option>
            <option value="Operations">Operations & Delivery</option>
            <option value="Inventory">Smart Inventory</option>
            <option value="Marketing">Marketing Optimization</option>
            <option value="Support">Customer Support</option>
          </select>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-500 font-medium">Priority:</span>
          <button
            onClick={() => setSelectedPriority('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedPriority === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedPriority('critical')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedPriority === 'critical' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-rose-700'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setSelectedPriority('high')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              selectedPriority === 'high' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-amber-700'
            }`}
          >
            High
          </button>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className={`bg-white rounded-2xl p-5 border transition shadow-sm flex flex-col justify-between ${
              rec.priority === 'Critical'
                ? 'border-rose-200 ring-1 ring-rose-200/50'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {rec.category} Diagnostic
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    rec.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : rec.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {rec.priority} Priority
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1">{rec.detectedIssue}</h4>

              {/* Supporting Metric */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Supporting Evidence / Baseline Metric
                </span>
                <p className="text-slate-800 font-medium mt-0.5">{rec.supportingMetric}</p>
              </div>

              {/* Suggested Action */}
              <div className="mb-3 text-xs">
                <span className="text-[10px] text-indigo-700 font-bold uppercase block mb-1">
                  Prescribed Turnaround Action
                </span>
                <p className="text-slate-800 font-semibold leading-relaxed bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                  {rec.suggestedAction}
                </p>
              </div>

              {/* Expected Impact & Reason */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                    Expected Direction of Impact
                  </span>
                  <p className="text-emerald-800 font-medium text-xs mt-0.5 flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {rec.expectedImpact}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    Strategic Rationale
                  </span>
                  <p className="text-[11px] text-slate-600 leading-snug mt-0.5 italic">
                    "{rec.reason}"
                  </p>
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Heuristic recommendation</span>
              <button
                onClick={() => onNavigateTab(getRouteForCategory(rec.category))}
                className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Inspect in {rec.category} Module <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          *System Methodology Notice: Recommendations represent algorithmic hypotheses for executive consideration, not proven causal certainties. Management should corroborate with localized ground feedback before capital deployment.
        </p>
      </div>
    </div>
  );
};
