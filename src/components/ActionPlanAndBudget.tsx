import React, { useState } from 'react';
import {
  CalendarCheck2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sliders,
  CheckSquare,
  Square,
  Building,
} from 'lucide-react';
import { BudgetInitiative } from '../types';
import { ROADMAP_STEPS } from '../data/seedData';
import { formatINR } from '../utils/formatters';

interface ActionPlanAndBudgetProps {
  initiatives: BudgetInitiative[];
  onUpdateInitiatives: (initiatives: BudgetInitiative[]) => void;
}

export const ActionPlanAndBudget: React.FC<ActionPlanAndBudgetProps> = ({
  initiatives,
  onUpdateInitiatives,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'budget'>('roadmap');
  const [roadmapData, setRoadmapData] = useState(ROADMAP_STEPS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate Total Allocated Budget in Lakh
  const totalAllocatedLakh = initiatives.reduce((sum, item) => sum + item.allocationLakh, 0);
  const maxBudgetLakh = 25.0;
  const remainingLakh = Number((maxBudgetLakh - totalAllocatedLakh).toFixed(2));
  const isOverBudget = totalAllocatedLakh > maxBudgetLakh;
  const utilizationPct = Math.min(100, Math.round((totalAllocatedLakh / maxBudgetLakh) * 100));

  const handleAllocationChange = (key: string, newLakh: number) => {
    const val = Math.max(0, Number(newLakh));
    const updated = initiatives.map((init) => {
      if (init.key === key) {
        return { ...init, allocationLakh: val };
      }
      return init;
    });
    onUpdateInitiatives(updated);
  };

  const handleResetBudget = () => {
    const reset = initiatives.map((init) => ({
      ...init,
      allocationLakh: init.recommendedLakh,
    }));
    onUpdateInitiatives(reset);
    setToastMessage('Budget reset to recommended ₹25 Lakh allocation.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleTaskCompletion = (monthIdx: number, taskIdx: number) => {
    const clone = JSON.parse(JSON.stringify(roadmapData));
    clone[monthIdx].tasks[taskIdx].completed = !clone[monthIdx].tasks[taskIdx].completed;
    setRoadmapData(clone);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Turnaround Roadmap & ₹25 Lakh Cap */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <CalendarCheck2 className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Six-Month Implementation Plan & ₹25 Lakh Budget Planner
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Structured Turnaround:</strong> A disciplined month-by-month rollout covering root-cause audits, kirana inventory sync,
              customer retention loops, and marketing efficiency. Strictly managed under an additional ₹25 Lakh budget ceiling.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'roadmap'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6-Month Roadmap
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                activeTab === 'budget'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ₹25L Budget Allocation
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {/* Over-budget warning banner */}
      {isOverBudget && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-xl text-xs text-rose-800 flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-900">Budget Limit Exceeded!</h4>
            <p className="mt-0.5 text-rose-700">
              Total allocated budget is <strong>₹{totalAllocatedLakh.toFixed(2)} Lakh</strong>, which exceeds the mandatory{' '}
              <strong>₹25.0 Lakh</strong> six-month turnaround ceiling by ₹{(totalAllocatedLakh - 25.0).toFixed(2)} Lakh.
              Please reallocate or click "Reset Allocation".
            </p>
          </div>
        </div>
      )}

      {activeTab === 'roadmap' ? (
        /* Visual 6-Month Timeline Roadmap */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmapData.map((step, mIdx) => {
              const completedCount = step.tasks.filter((t) => t.completed).length;
              const isMonthFinished = completedCount === step.tasks.length;
              return (
                <div
                  key={step.month}
                  className={`bg-white rounded-2xl p-4 border transition shadow-sm ${
                    isMonthFinished
                      ? 'border-emerald-300 bg-emerald-50/15'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        M{step.month}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{step.title.split(':')[1] || step.title}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      ₹{step.budgetLakh}L
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-indigo-700 mt-2">
                    Focus: {step.theme}
                  </p>

                  <div className="mt-3 space-y-2">
                    {step.tasks.map((task, tIdx) => (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskCompletion(mIdx, tIdx)}
                        className="flex items-start space-x-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition"
                      >
                        <button className="mt-0.5 text-slate-400 hover:text-indigo-600 flex-shrink-0">
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <span className={`text-[11px] leading-tight ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {completedCount} of {step.tasks.length} actions complete
                    </span>
                    <span className="font-mono font-bold text-slate-600">
                      {Math.round((completedCount / step.tasks.length) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ₹25 Lakh Budget Allocation Panel */
        <div className="space-y-6">
          {/* Summary KPI Bar */}
          <div className="bg-slate-900 p-5 rounded-2xl text-white shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Fund Cap</span>
                <span className="text-xl font-black text-white font-mono">₹25.0 Lakh</span>
                <span className="text-[10px] text-slate-400 block">6-Month Ceiling</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Allocated</span>
                <span
                  className={`text-xl font-black font-mono ${
                    isOverBudget ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ₹{totalAllocatedLakh.toFixed(2)} Lakh
                </span>
                <span className="text-[10px] text-slate-400 block">{utilizationPct}% utilized</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Remaining Reserve</span>
                <span
                  className={`text-xl font-black font-mono ${
                    remainingLakh < 0 ? 'text-rose-400' : 'text-indigo-300'
                  }`}
                >
                  ₹{remainingLakh.toFixed(2)} Lakh
                </span>
                <span className="text-[10px] text-slate-400 block">Contingency buffer</span>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={handleResetBudget}
                  className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset Allocation
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(100, (totalAllocatedLakh / 25.0) * 100)}%` }}
              />
            </div>
          </div>

          {/* Editable Initiatives Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Initiative-Wise Resource Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate capital across turnaround pillars. Enforcing maximum budget cap of ₹25 Lakh.
            </p>

            <div className="space-y-4">
              {initiatives.map((init) => (
                <div
                  key={init.key}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{init.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                        {init.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{init.description}</p>
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-700 font-medium pt-1">
                      <span>Impact:</span>
                      {init.kpisImpacted.map((kpi, idx) => (
                        <span key={idx} className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {kpi}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Allocation Slider & Input */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Allocated (Lakh)
                      </span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-xs font-bold text-slate-500">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="15"
                          value={init.allocationLakh}
                          onChange={(e) => handleAllocationChange(init.key, Number(e.target.value))}
                          className="w-20 text-right font-mono font-bold text-sm p-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-slate-700">L</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
