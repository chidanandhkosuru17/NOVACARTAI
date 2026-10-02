import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
  RotateCcw,
  Store,
  Truck,
  Repeat,
  DollarSign,
  Cpu,
} from 'lucide-react';
import { TabKey } from './Sidebar';

interface AiBusinessCopilotProps {
  onNavigateTab: (tab: TabKey) => void;
}

interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  recommendationCard?: {
    title: string;
    priority: 'Critical' | 'High' | 'Strategic';
    problemDetected: string;
    supportingMetric: string;
    suggestedAction: string;
    expectedImpact: string;
    evidenceLimitation: string;
    actionTab: TabKey;
    actionLabel: string;
  };
}

export const AiBusinessCopilot: React.FC<AiBusinessCopilotProps> = ({ onNavigateTab }) => {
  const [inputText, setInputText] = useState('');

  const suggestedQuestions = [
    'Why are cancellations increasing?',
    'How can we improve repeat purchases?',
    'Which stores have inventory problems?',
    'Where should marketing spending be reduced?',
    'How can we improve delivery performance?',
    'What should NOVA CART prioritize this month?',
  ];

  const knowledgeBase: Record<string, CopilotMessage['recommendationCard']> = {
    cancellations: {
      title: 'Cancellations Root-Cause: Kirana Stock Mismatches & Peak Delays',
      priority: 'Critical',
      problemDetected: 'Cancellation rate surged from 6% to 11%, costing ~4,235 lost orders monthly.',
      supportingMetric: '62% of cancellations stem from item stockouts and busy-hour store rejections in Hyderabad & Bengaluru.',
      suggestedAction: 'Deploy automated real-time Kirana catalog sync with Busy-Store order pausing to prevent customer disappointment.',
      expectedImpact: 'Projected to reduce cancellations from 11% to 4.5%, preserving ₹2.8 Lakh monthly revenue.',
      evidenceLimitation: 'Based on baseline challenge dataset telemetry. Assumes 85%+ retailer compliance on smartphone sync.',
      actionTab: 'order_rescue',
      actionLabel: 'Launch Order Rescue Center',
    },
    repeat: {
      title: 'Customer Retention: 3-Streak Milestone Gamification',
      priority: 'Critical',
      problemDetected: 'Repeat purchase rate dropped from 41% to 27%. 69% of new buyers churn after order #1.',
      supportingMetric: 'Buyers who complete 3 consecutive orders jump to a 72% 30-day retention probability.',
      suggestedAction: 'Redirect 40% of acquisition ad spend into "Order 2 in 7 Days" and "Order 3 VIP Tier" milestone vouchers.',
      expectedImpact: 'Lifts repeat purchase rate from 27% to 38%+, adding ₹4.2 Lakh incremental gross margin.',
      evidenceLimitation: 'Modeled using cohort RFM historical curves across 14,200 new customer accounts.',
      actionTab: 'customer_intelligence',
      actionLabel: 'Open Retention Intelligence',
    },
    inventory: {
      title: 'Store Inventory Accuracy & Substitution Engine',
      priority: 'High',
      problemDetected: '18% of catalog items experience phantom stockouts where app shows available but offline shelf is empty.',
      supportingMetric: 'Neighborhood marts in Kukatpally and Kondapur report lowest shelf synchronization fidelity (68%).',
      suggestedAction: 'Trigger automatic alternative-store product re-routing when a product is flagged unavailable.',
      expectedImpact: 'Prevents 1,800 avoidable customer dropouts and eliminates negative support ticket generation.',
      evidenceLimitation: 'Requires customer opt-in for 1-click alternative store price substitutions.',
      actionTab: 'inventory',
      actionLabel: 'Check Smart Inventory',
    },
    marketing: {
      title: 'Marketing Burn: Eliminate 44% Unused Coupon Breakage',
      priority: 'High',
      problemDetected: 'Monthly marketing burn stands at ₹17 Lakh (65% of GMV), with ₹7.4 Lakh wasted on unredeemed vouchers.',
      supportingMetric: '58% spent on customer acquisition with steep 30-day churn; only 42% on retention.',
      suggestedAction: 'Enforce strict ₹25 Lakh 6-month budget cap. Reallocate funds from blanket acquisition discounts to high-LTV milestone retention.',
      expectedImpact: 'Lowers effective CAC by 35% and improves marketing ROI from 1.5x to 2.8x.',
      evidenceLimitation: 'Forecast based on re-allocating budget across the 6 approved turnaround initiatives.',
      actionTab: 'promotions',
      actionLabel: 'View Marketing Studio',
    },
    delivery: {
      title: 'Delivery SLA: Sub-30 Minute Micro-Hub Clustering',
      priority: 'Strategic',
      problemDetected: 'Average delivery time climbed from 29 mins to 37 mins. 13% of orders are delivered >15m late.',
      supportingMetric: 'Orders delayed beyond 35 minutes experience a 2.4x drop in repeat order probability within 14 days.',
      suggestedAction: 'Restrict dispatch radius to 1.8km micro-clusters and implement pooled multi-store neighborhood batching.',
      expectedImpact: 'Reduces delivery SLA to 26 minutes average; recovers at-risk customer repeat velocity.',
      evidenceLimitation: 'Depends on rider fleet density across Hyderabad, Bengaluru, and Mumbai corridors.',
      actionTab: 'order_rescue',
      actionLabel: 'Review Delivery Dispatch',
    },
    prioritize: {
      title: 'NOVA CART 30-Day Executive Turnaround Priority',
      priority: 'Critical',
      problemDetected: 'Gross volume is growing (+20%), but operational leaks (11% cancel, 27% repeat) erode all unit economics.',
      supportingMetric: 'Support desk flooded with 5,900 tickets/month; refunds take 9.2 hours average.',
      suggestedAction: 'Execute the 3-step turnaround: (1) Instant UPI refund webhooks, (2) Kirana inventory sync, (3) 3-order streak retention milestone.',
      expectedImpact: 'Achieves profitable positive unit economics within 90 days under the ₹25 Lakh budget ceiling.',
      evidenceLimitation: 'Synthesized from complete executive turnaround matrix and simulation assumptions.',
      actionTab: 'simulator',
      actionLabel: 'Run Rescue Simulator',
    },
  };

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-1',
      sender: 'copilot',
      text: "Hello! I am your NOVA CART AI Business Copilot. I analyze real-time platform telemetry across customer retention, retailer stockouts, delivery SLAs, and our ₹25 Lakh rescue fund. How can I assist your executive decisions today?",
      timestamp: 'Just now',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'What should NOVA CART prioritize this month?',
      timestamp: 'Just now',
    },
    {
      id: 'msg-3',
      sender: 'copilot',
      text: "Based on our latest 6-month operational telemetry, gross orders are growing (+20%), but severe operational leaks threaten solvency. Here is the recommended strategic priority:",
      timestamp: 'Just now',
      recommendationCard: knowledgeBase['prioritize'],
    },
  ]);

  const handleAskQuestion = (questionText: string) => {
    const qLower = questionText.toLowerCase();

    let matchedCard = knowledgeBase['prioritize'];
    if (qLower.includes('cancel')) matchedCard = knowledgeBase['cancellations'];
    else if (qLower.includes('repeat') || qLower.includes('retention')) matchedCard = knowledgeBase['repeat'];
    else if (qLower.includes('inventory') || qLower.includes('store')) matchedCard = knowledgeBase['inventory'];
    else if (qLower.includes('market') || qLower.includes('spend') || qLower.includes('budget')) matchedCard = knowledgeBase['marketing'];
    else if (qLower.includes('deliver') || qLower.includes('sla') || qLower.includes('speed')) matchedCard = knowledgeBase['delivery'];

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: questionText,
      timestamp: 'Just now',
    };

    const copilotMsg: CopilotMessage = {
      id: `msg-${Date.now()}-c`,
      sender: 'copilot',
      text: `Here is the explainable intelligence assessment from our business rescue telemetry:`,
      timestamp: 'Just now',
      recommendationCard: matchedCard,
    };

    setMessages((prev) => [...prev, userMsg, copilotMsg]);
    setInputText('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-6 text-white shadow-2xl border border-indigo-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>DETERMINISTIC EXPLAINABLE BUSINESS COPILOT</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              NOVA CART AI Business Copilot
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ask operational, financial, and retention questions. Generates grounded recommendations with detected problems, supporting metrics, expected impact, and direct intervention shortcuts.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 text-xs">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300 font-mono font-bold">Audit Matrix Active</span>
          </div>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        <span className="text-xs text-slate-400 font-bold whitespace-nowrap flex-shrink-0">
          Quick Prompts:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleAskQuestion(q)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold whitespace-nowrap transition flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Main Chat & Recommendation Stream */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-4 rounded-3xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-br-none shadow-md'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-800/60">
                  <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                    {msg.sender === 'user' ? 'You (Executive)' : 'AI Copilot'}
                  </span>
                  <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                </div>
                <p>{msg.text}</p>
              </div>

              {/* Recommendation Card Attachment */}
              {msg.recommendationCard && (
                <div className="mt-3 max-w-2xl w-full bg-slate-950 p-5 rounded-3xl border border-indigo-500/40 shadow-2xl space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-white">
                        {msg.recommendationCard.title}
                      </h4>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                        msg.recommendationCard.priority === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {msg.recommendationCard.priority} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Problem Detected</span>
                      <span className="text-rose-300 font-semibold">{msg.recommendationCard.problemDetected}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Supporting Telemetry</span>
                      <span className="text-slate-300 font-semibold">{msg.recommendationCard.supportingMetric}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Strategic Action</span>
                      <span className="text-emerald-300 font-semibold">{msg.recommendationCard.suggestedAction}</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-bold uppercase">Expected Impact</span>
                      <span className="text-white font-bold">{msg.recommendationCard.expectedImpact}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-500 italic max-w-sm">
                      Evidence note: {msg.recommendationCard.evidenceLimitation}
                    </p>
                    <button
                      onClick={() => onNavigateTab(msg.recommendationCard!.actionTab)}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                    >
                      <span>{msg.recommendationCard.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) handleAskQuestion(inputText);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Copilot about repeat rates, cancellations, budget reallocation, or delivery delays..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
