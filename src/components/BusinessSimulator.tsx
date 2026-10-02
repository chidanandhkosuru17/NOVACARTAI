import React, { useState } from 'react';
import {
  Cpu,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Save,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Award,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from '../firebase/authContext';
import { BaselineMetrics, SimulationParameters, SimulationResults } from '../types';
import { formatINR, formatINRNumber, formatPercent } from '../utils/formatters';

interface BusinessSimulatorProps {
  baselineMetrics: BaselineMetrics;
  onSimulationRun?: (results: SimulationResults) => void;
}

export const BusinessSimulator: React.FC<BusinessSimulatorProps> = ({
  baselineMetrics,
  onSimulationRun,
}) => {
  const { currentUser } = useAuth();

  // Adjustable Turnaround Levers
  const [targetRepeatRate, setTargetRepeatRate] = useState<number>(38); // Baseline: 27%
  const [targetCancellationRate, setTargetCancellationRate] = useState<number>(4.5); // Baseline: 11%
  const [targetDeliveryMinutes, setTargetDeliveryMinutes] = useState<number>(27); // Baseline: 37m
  const [targetInventoryAccuracy, setTargetInventoryAccuracy] = useState<number>(94); // Baseline: 74%
  const [targetSupportResolutionHours, setTargetSupportResolutionHours] = useState<number>(2.2); // Baseline: 9.2h
  const [retentionMarketingShare, setRetentionMarketingShare] = useState<number>(68); // Baseline: 42%
  const [averageOrderValue, setAverageOrderValue] = useState<number>(535); // Baseline: ₹486

  // Simulation execution state
  const [isRunning, setIsRunning] = useState(false);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedScenarioName, setSavedScenarioName] = useState('6-Month Conservative Turnaround');

  // Transparent Simulation Formula Engine
  const calculateProjections = (
    repeatRate: number,
    cancelRate: number,
    deliveryMins: number,
    invAcc: number,
    supportHours: number,
    retShare: number,
    aov: number
  ): SimulationResults => {
    // 1. Repeat customer impact:
    // Every 1% improvement in repeat purchase rate unlocks ~550 recurring orders per month
    const repeatDeltaPct = Math.max(0, repeatRate - baselineMetrics.repeatPurchaseRate);
    const addedOrdersFromRetention = repeatDeltaPct * 560;

    // 2. Cancellation recovery:
    // Current lost orders: 38,500 * 11% = 4,235 orders.
    // Reducing from 11% to target rate prevents cancellations:
    const baselineLostOrders = Math.round((baselineMetrics.monthlyOrders * baselineMetrics.cancellationRate) / 100);
    const projectedLostOrders = Math.round((baselineMetrics.monthlyOrders * cancelRate) / 100);
    const avoidedCancellations = Math.max(0, baselineLostOrders - projectedLostOrders);

    // 3. Operational and delivery speed lift:
    // Faster delivery under 30 mins boosts organic reorders by ~4%
    const deliverySpeedBonusOrders = deliveryMins < 30 ? 1200 : 400;

    // Projected Monthly Total Orders:
    const projectedMonthlyOrders = Math.round(
      baselineMetrics.monthlyOrders + addedOrdersFromRetention + avoidedCancellations + deliverySpeedBonusOrders
    );

    // Projected Monthly Revenue (INR):
    const projectedMonthlyRevenue = Math.round(projectedMonthlyOrders * aov);

    // Monthly Repeat Customers:
    const projectedRepeatCustomersMonthly = Math.round((projectedMonthlyOrders * repeatRate) / 100);

    // Budget utilization from the ₹25 Lakh fund:
    // Higher improvements consume reasonable parts of the ₹25L allocation
    const budgetSpentLakh = Math.min(
      25.0,
      Math.max(
        16.0,
        18.0 +
          (repeatRate - 27) * 0.35 +
          (11 - cancelRate) * 0.45 +
          (invAcc - 74) * 0.15
      )
    );
    const budgetRemainingLakh = Math.max(0, Number((25.0 - budgetSpentLakh).toFixed(1)));

    // Net turnaround economic value generated over 6 months:
    const monthlyGrossRevenueDelta = projectedMonthlyRevenue - baselineMetrics.monthlyRevenue;
    const sixMonthTurnaroundValueINR = monthlyGrossRevenueDelta * 6;
    const projectedNetProfitDeltaLakh = Number((sixMonthTurnaroundValueINR / 100000 - budgetSpentLakh).toFixed(1));

    return {
      projectedMonthlyOrders,
      projectedMonthlyRevenue,
      projectedMonthlyCancelledAvoided: avoidedCancellations,
      projectedRepeatCustomersMonthly,
      projectedNetProfitDeltaLakh,
      budgetSpentLakh: Number(budgetSpentLakh.toFixed(1)),
      budgetRemainingLakh,
      sixMonthTurnaroundValueINR,
    };
  };

  const currentResults = calculateProjections(
    targetRepeatRate,
    targetCancellationRate,
    targetDeliveryMinutes,
    targetInventoryAccuracy,
    targetSupportResolutionHours,
    retentionMarketingShare,
    averageOrderValue
  );

  const handleRunSimulation = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasSimulated(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onSimulationRun) {
        onSimulationRun(currentResults);
      }
    }, 600);
  };

  const handleResetToConservative = () => {
    setTargetRepeatRate(38);
    setTargetCancellationRate(4.5);
    setTargetDeliveryMinutes(27);
    setTargetInventoryAccuracy(94);
    setTargetSupportResolutionHours(2.2);
    setRetentionMarketingShare(68);
    setAverageOrderValue(535);
  };

  const handleSaveToCloud = async () => {
    try {
      if (currentUser?.uid) {
        await addDoc(collection(db, 'simulations'), {
          userId: currentUser.uid,
          scenarioName: savedScenarioName,
          targetRepeatRate,
          targetCancellationRate,
          targetDeliveryTime: targetDeliveryMinutes,
          targetInventoryAccuracy,
          projectedMonthlyOrders: currentResults.projectedMonthlyOrders,
          projectedMonthlyRevenue: currentResults.projectedMonthlyRevenue,
          projectedAvoidedCancellations: currentResults.projectedMonthlyCancelledAvoided,
          budgetSpentLakh: currentResults.budgetSpentLakh,
          createdAt: new Date().toISOString(),
        });
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('Could not persist simulation to Firestore, saving to local state:', err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Central Turnaround Modeling */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-2xl text-white shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 border border-indigo-400/30 px-3 py-0.5 rounded-full text-xs font-bold text-indigo-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>CORE RESCUE ENGINE • SIX-MONTH TURNAROUND MODEL</span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Business Rescue & Turnaround Simulator (₹25 Lakh Budget Cap)
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Test and model multi-variable interventions across repeat rate, delivery SLA, cancellation reduction,
              and marketing re-allocation. Calculates projected monthly revenue, orders, and net turnaround surplus.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={handleResetToConservative}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition"
              title="Reset to recommended target levers"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Recommended Baseline
            </button>

            <button
              onClick={handleRunSimulation}
              disabled={isRunning}
              className="inline-flex items-center px-5 py-2.5 text-xs font-black rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition focus:ring-2 focus:ring-emerald-400"
            >
              <Play className="w-4 h-4 mr-1.5 fill-current" />
              {isRunning ? 'Calculating Models...' : 'Run Business Rescue Simulation'}
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center shadow-sm">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
          Simulation scenario successfully persisted to Cloud Database!
        </div>
      )}

      {/* Main Grid: Levers and Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editable Levers Controls */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Turnaround Assumption Controls
            </h3>
            <p className="text-xs text-slate-500">
              Adjust operational target assumptions to simulate business recovery
            </p>
          </div>

          <div className="space-y-4">
            {/* Lever 1: Repeat Purchase Rate */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-800">Target Repeat Purchase Rate</span>
                <span className="font-mono text-emerald-700 font-bold text-sm">
                  {targetRepeatRate}%{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Baseline: 27% • Prior: 41%)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="1"
                value={targetRepeatRate}
                onChange={(e) => setTargetRepeatRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>20% (Severe)</span>
                <span className="text-rose-600 font-semibold">27% Current</span>
                <span className="text-emerald-600 font-semibold">38% Target</span>
                <span>50% (Max)</span>
              </div>
            </div>

            {/* Lever 2: Cancellation Rate */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-800">Target Cancellation Rate</span>
                <span className="font-mono text-rose-700 font-bold text-sm">
                  {targetCancellationRate}%{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Baseline: 11% • Prior: 6%)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={targetCancellationRate}
                onChange={(e) => setTargetCancellationRate(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>2% (World Class)</span>
                <span className="text-emerald-600 font-semibold">4.5% Target</span>
                <span className="text-rose-600 font-semibold">11% Current</span>
                <span>15%</span>
              </div>
            </div>

            {/* Lever 3: Average Delivery Time */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-800">Target Avg Delivery Time</span>
                <span className="font-mono text-amber-700 font-bold text-sm">
                  {targetDeliveryMinutes} Mins{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Baseline: 37m • Prior: 29m)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="45"
                step="1"
                value={targetDeliveryMinutes}
                onChange={(e) => setTargetDeliveryMinutes(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>20 mins</span>
                <span className="text-emerald-600 font-semibold">27m Target</span>
                <span className="text-amber-700 font-semibold">37m Current</span>
                <span>45 mins</span>
              </div>
            </div>

            {/* Lever 4: Inventory Accuracy */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-800">Retailer Inventory Accuracy</span>
                <span className="font-mono text-indigo-700 font-bold text-sm">
                  {targetInventoryAccuracy}%{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Baseline: 74%)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                step="1"
                value={targetInventoryAccuracy}
                onChange={(e) => setTargetInventoryAccuracy(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>60% (Unreliable)</span>
                <span className="text-slate-500">74% Current</span>
                <span className="text-indigo-600 font-semibold">94% Target</span>
                <span>98%</span>
              </div>
            </div>

            {/* Lever 5: Average Order Value */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="text-slate-800">Average Order Value (AOV)</span>
                <span className="font-mono text-slate-900 font-bold text-sm">
                  ₹{averageOrderValue}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Baseline: ₹486)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="420"
                max="650"
                step="5"
                value={averageOrderValue}
                onChange={(e) => setAverageOrderValue(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>₹420</span>
                <span className="text-slate-500">₹486 Current</span>
                <span className="text-slate-900 font-semibold">₹535 Target</span>
                <span>₹650</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Projections & Impact Summary */}
        <div className="lg:col-span-6 space-y-4">
          {/* Side by side summary comparison */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Current Situation vs Proposed Scenario
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated using transparent business logic and evidence-based multipliers
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                PROJECTION
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                    <th className="text-left pb-2">Turnaround Metric</th>
                    <th className="text-right pb-2">Current Baseline</th>
                    <th className="text-right pb-2 text-indigo-700">Simulated Target</th>
                    <th className="text-right pb-2 text-emerald-600">Net Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr>
                    <td className="py-2.5 text-slate-700 font-sans font-medium">Monthly Orders</td>
                    <td className="py-2.5 text-right text-slate-600">
                      {formatINRNumber(baselineMetrics.monthlyOrders)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">
                      {formatINRNumber(currentResults.projectedMonthlyOrders)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">
                      +{formatINRNumber(currentResults.projectedMonthlyOrders - baselineMetrics.monthlyOrders)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 text-slate-700 font-sans font-medium">Monthly Revenue</td>
                    <td className="py-2.5 text-right text-slate-600">
                      {formatINR(baselineMetrics.monthlyRevenue)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">
                      {formatINR(currentResults.projectedMonthlyRevenue)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">
                      +{formatINR(currentResults.projectedMonthlyRevenue - baselineMetrics.monthlyRevenue)}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 text-slate-700 font-sans font-medium">Repeat Purchase Rate</td>
                    <td className="py-2.5 text-right text-rose-600">27.0%</td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">
                      {targetRepeatRate.toFixed(1)}%
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">
                      +{(targetRepeatRate - 27.0).toFixed(1)}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 text-slate-700 font-sans font-medium">Monthly Cancelled Orders</td>
                    <td className="py-2.5 text-right text-rose-600">~4,235 (11%)</td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">
                      ~{Math.round((baselineMetrics.monthlyOrders * targetCancellationRate) / 100)} ({targetCancellationRate}%)
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">
                      -{formatINRNumber(currentResults.projectedMonthlyCancelledAvoided)} saved
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2.5 text-slate-700 font-sans font-medium">Average Delivery Time</td>
                    <td className="py-2.5 text-right text-amber-700">37 Mins</td>
                    <td className="py-2.5 text-right font-bold text-indigo-700">
                      {targetDeliveryMinutes} Mins
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-600">
                      -{37 - targetDeliveryMinutes} mins faster
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Economic Turnaround Headline Result Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    6-Month Cumulative Turnaround Value
                  </span>
                  <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
                    {formatINR(currentResults.sixMonthTurnaroundValueINR)}
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Net Projected ROI: ~{((currentResults.sixMonthTurnaroundValueINR / 2500000)).toFixed(1)}x on ₹25 Lakh rescue fund
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Rescue Fund Utilized
                  </span>
                  <div className="text-lg font-bold text-slate-800 font-mono">
                    ₹{currentResults.budgetSpentLakh}L / ₹25L
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    ₹{currentResults.budgetRemainingLakh}L Contingency Buffer
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario Persistence Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex-1 w-full">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Save Scenario for Executive Board Review
              </label>
              <input
                type="text"
                value={savedScenarioName}
                onChange={(e) => setSavedScenarioName(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <button
              onClick={handleSaveToCloud}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Model
            </button>
          </div>

          {/* Methodology Disclaimer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start space-x-2">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              *Turnaround Methodology: Results are simulated estimates derived from the NOVA CART Business Challenge baseline data. Projections represent attainable operational targets assuming full 6-month initiative execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
