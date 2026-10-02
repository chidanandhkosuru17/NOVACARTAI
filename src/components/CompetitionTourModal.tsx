import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Store,
  LayoutDashboard,
  Truck,
  Cpu,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { TabKey } from './Sidebar';

export type UserEnvironment = 'customer' | 'retailer' | 'admin';

interface CompetitionTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRole: (role: UserEnvironment) => void;
  onSelectTab: (tab: TabKey) => void;
  onResetDemoData: () => void;
  onOpenReport: () => void;
}

interface TourStep {
  stepNumber: number;
  environment: UserEnvironment;
  adminTab?: TabKey;
  title: string;
  category: string;
  headline: string;
  narrative: string;
  actionInstruction: string;
}

export const CompetitionTourModal: React.FC<CompetitionTourModalProps> = ({
  isOpen,
  onClose,
  onSwitchRole,
  onSelectTab,
  onResetDemoData,
  onOpenReport,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const tourSteps: TourStep[] = [
    {
      stepNumber: 1,
      environment: 'customer',
      title: 'Customer Shopping Experience',
      category: 'Step 1 of 10 • Customer Discovery',
      headline: 'Hyperlocal Store Discovery in Hyderabad',
      narrative:
        'Welcome to NOVA CART. Customers can discover neighborhood Kirana stores, pharmacies, bakeries, and dairies across Hyderabad (Madhapur, Kukatpally, Gachibowli, Kondapur, Miyapur).',
      actionInstruction:
        'Browse product categories, explore nearby stores, and examine delivery times and transparent pricing.',
    },
    {
      stepNumber: 2,
      environment: 'customer',
      title: 'Place a Sample Grocery Order',
      category: 'Step 2 of 10 • Connected Checkout',
      headline: 'Instant Cart & Transparent Checkout',
      narrative:
        'When customers add essentials like Aashirvaad Atta and Amul Milk to cart, transparent fees are shown upfront before payment. Demo payment methods include UPI Demo, Cash on Delivery, and Card Demo.',
      actionInstruction:
        'Add an item to your cart and click "Proceed to Checkout" to generate a live demo order with simulated delivery tracking.',
    },
    {
      stepNumber: 3,
      environment: 'retailer',
      title: 'Switch to the Retailer Portal',
      category: 'Step 3 of 10 • Local Merchant Ops',
      headline: 'Balaji Provisions Store Fulfillment Console',
      narrative:
        'Local merchants receive orders instantly in their dedicated portal without complex hardware. The retailer can monitor today’s sales, pending fulfillments, and toggle "Busy Store Mode".',
      actionInstruction:
        'Observe the real-time order synchronized directly from the customer shopping interface.',
    },
    {
      stepNumber: 4,
      environment: 'retailer',
      title: 'Accept and Prepare the Order',
      category: 'Step 4 of 10 • Multi-Stage Fulfillment',
      headline: 'Real-Time Preparation Status Pipeline',
      narrative:
        'Merchants advance orders through the 6 stages: "Order Placed" → "Retailer Accepted" → "Preparing Order" → "Ready for Pickup" → "Out for Delivery" → "Delivered".',
      actionInstruction:
        'Click "Accept Order" or "Start Prep" to watch customer-facing tracking update instantaneously.',
    },
    {
      stepNumber: 5,
      environment: 'customer',
      title: 'Demonstrate an Inventory Mismatch',
      category: 'Step 5 of 10 • Stockout Prevention',
      headline: 'Catalog Protection & Stockout Warnings',
      narrative:
        'In the demo dataset, Fresh Bananas is intentionally marked "Out of Stock" at Sri Krishna Dairy to demonstrate how NOVA CART prevents the #1 cause of quick-commerce cancellations.',
      actionInstruction:
        'Open the product detail for the out-of-stock item in the Customer App to view the availability guard.',
    },
    {
      stepNumber: 6,
      environment: 'customer',
      title: 'Alternative-Store Recommendation',
      category: 'Step 6 of 10 • AI Substitution Engine',
      headline: 'Suggesting Nearby Stores with In-Stock Products',
      narrative:
        'Rather than silently dropping the order or forcing cancellation, NOVA CART automatically identifies an alternative neighborhood store (Balaji Supermarket) and asks the customer to approve the substitution.',
      actionInstruction:
        'Click "Accept Alternative Store & Add to Cart" to see the customer seamlessly recover the purchase.',
    },
    {
      stepNumber: 7,
      environment: 'admin',
      adminTab: 'executive',
      title: 'Admin Command Center Overview',
      category: 'Step 7 of 10 • Executive Diagnostics',
      headline: '120k Users, ₹26.1L Revenue & Operational Bleed',
      narrative:
        'Switch to the Admin Command Center. NOVA CART has scaled to 120,000 customers and ₹26.1L monthly revenue, but repeat rate has fallen to 27%, cancellations stand at 11%, and monthly marketing burn is ₹17L.',
      actionInstruction:
        'Review the baseline challenge KPI matrix and diagnostic trend charts comparing growth vs churn.',
    },
    {
      stepNumber: 8,
      environment: 'admin',
      adminTab: 'order_rescue',
      title: 'Order Rescue & Inventory Insights',
      category: 'Step 8 of 10 • Operations Command',
      headline: 'Heuristic Detection & Proactive Mitigation',
      narrative:
        'The Order Rescue Center catches orders at risk: delayed rider dispatches, merchant stockouts, and cancellations. Operational teams intervene with 1 tap.',
      actionInstruction:
        'Click "Mitigate" or view the incident log to inspect how delay notifications protect customer trust.',
    },
    {
      stepNumber: 9,
      environment: 'admin',
      adminTab: 'recommendations',
      title: 'AI Business Copilot & Recommendations',
      category: 'Step 9 of 10 • Decision Intelligence',
      headline: 'Explainable Rule-Based Strategic Guidance',
      narrative:
        'The AI recommendation engine analyzes 620 retailers and provides explainable turnaround advice: prioritizes 3-streak milestones, cuts 44% unused coupon burn, and recommends micro-hub dispatch.',
      actionInstruction:
        'Examine the strategic priority alerts, supporting metrics, and projected impact estimates.',
    },
    {
      stepNumber: 10,
      environment: 'admin',
      adminTab: 'simulator',
      title: 'Business Rescue Simulator (₹25L Cap)',
      category: 'Step 10 of 10 • Interactive Scenario Sim',
      headline: 'Simulate 6-Month Turnaround Under ₹25 Lakh Investment',
      narrative:
        'Judges can interactively adjust repeat purchase rate, cancellation reduction, and marketing reallocation to model the 6-month financial trajectory toward ₹32.8L+ revenue and sustainable profitability.',
      actionInstruction:
        'Adjust the sliders to compare Current Baseline vs Proposed Scenario, or click "Reset Demo Data" to restart the presentation.',
    },
  ];

  const currentStep = tourSteps[currentStepIndex];

  const handleApplyStep = (step: TourStep) => {
    onSwitchRole(step.environment);
    if (step.environment === 'admin' && step.adminTab) {
      onSelectTab(step.adminTab);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < tourSteps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      handleApplyStep(tourSteps[nextIdx]);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      handleApplyStep(tourSteps[prevIdx]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                {currentStep.category}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                NOVA CART Presentation Mode
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onResetDemoData}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition flex items-center space-x-1"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset Data</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
              Step {currentStep.stepNumber} of 10
            </span>
            <span className="text-xs text-slate-400">
              Environment:{' '}
              <strong className="text-white capitalize">{currentStep.environment}</strong>
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white">
            {currentStep.headline}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentStep.narrative}
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-1.5">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Competition Judge Observation & Action:
            </span>
            <p className="text-xs text-slate-200 font-medium">
              {currentStep.actionInstruction}
            </p>
          </div>
        </div>

        {/* Step Dots Progress */}
        <div className="flex items-center justify-center space-x-1.5 pt-2">
          {tourSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStepIndex(idx);
                handleApplyStep(tourSteps[idx]);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'w-7 bg-indigo-500'
                  : 'w-2 bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold disabled:opacity-30 transition flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                handleApplyStep(currentStep);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Close & Interact
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2"
            >
              <span>{currentStepIndex === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
