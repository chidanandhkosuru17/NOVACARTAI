import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  User,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageSquare,
} from 'lucide-react';
import { SupportTicket } from '../types';

interface SupportTicketsProps {
  tickets: SupportTicket[];
  onUpdateTickets: (tickets: SupportTicket[]) => void;
}

export const SupportTickets: React.FC<SupportTicketsProps> = ({
  tickets,
  onUpdateTickets,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New ticket state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newOrderId, setNewOrderId] = useState('NC-94812');
  const [newCategory, setNewCategory] = useState<SupportTicket['category']>('Refund');
  const [newPriority, setNewPriority] = useState<SupportTicket['priority']>('High');
  const [newDescription, setNewDescription] = useState('');

  // Selected ticket for resolution note
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'open' && (t.status === 'Open' || t.status === 'In Progress')) ||
      (statusFilter === 'resolved' && t.status === 'Resolved') ||
      (statusFilter === 'critical' && (t.priority === 'Critical' || t.priority === 'High'));

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleUpdateStatus = (ticketId: string, status: SupportTicket['status']) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          resolutionNotes:
            status === 'Resolved' && !t.resolutionNotes
              ? 'Resolved via automated turnaround protocol.'
              : t.resolutionNotes,
        };
      }
      return t;
    });
    onUpdateTickets(updated);
    setToastMessage(`Ticket ${ticketId} marked as ${status}!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveResolution = (ticketId: string) => {
    if (!resolutionText.trim()) return;
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          resolutionNotes: resolutionText.trim(),
          status: 'Resolved' as SupportTicket['status'],
        };
      }
      return t;
    });
    onUpdateTickets(updated);
    setEditingTicketId(null);
    setResolutionText('');
    setToastMessage(`Ticket ${ticketId} resolved with custom notes!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newDescription.trim()) return;

    const created: SupportTicket = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      customerName: newCustomerName.trim(),
      orderId: newOrderId.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'Open',
      timeAgo: 'Just now',
      assignedAgent: 'Aditi Rao',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      description: newDescription.trim(),
      resolutionNotes: '',
    };

    onUpdateTickets([created, ...tickets]);
    setIsCreateModalOpen(false);
    setNewCustomerName('');
    setNewDescription('');
    setToastMessage(`Ticket ${created.id} created & routed to priority agent!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Support Load Diagnostics */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <LifeBuoy className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Customer Support & Rapid Refund Management Desk
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              <strong>Challenge Diagnosis:</strong> Monthly ticket volume escalated from 3,100 to 5,900 (+90%), with an average resolution latency of 9.2 hours.
              Top complaint drivers: delayed deliveries (34%), refund disputes (28%), missing items from grocery bags (22%), and coupon checkouts (11%).
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center flex-shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Open Tickets</span>
              <span className="text-xl font-black text-rose-600 font-mono">{openCount}</span>
            </div>
            <div className="border-x border-slate-200 px-3">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">In Progress</span>
              <span className="text-xl font-black text-amber-600 font-mono">{inProgressCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Avg Resolution</span>
              <span className="text-xl font-black text-slate-800 font-mono">9.2h</span>
              <span className="text-[9px] text-slate-400 block">Target: 2.0h</span>
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

      {/* Support Root Cause Insights Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-rose-700 font-bold mb-1">
            <span>1. Delivery Delays (34%)</span>
            <span>2,006 / mo</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-tight">
            <strong>Turnaround Action:</strong> Proactive WhatsApp delay alerts with automated ₹50 credit before customer initiates support inquiry.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-indigo-700 font-bold mb-1">
            <span>2. Refund Disputes (28%)</span>
            <span>1,652 / mo</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-tight">
            <strong>Turnaround Action:</strong> Instant UPI refund webhook triggered automatically on store rejection without human review queue.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-amber-700 font-bold mb-1">
            <span>3. Missing Products (22%)</span>
            <span>1,298 / mo</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-tight">
            <strong>Turnaround Action:</strong> Mandate retailer 1-tap bag item check before handing parcel to delivery rider; tamper-evident stickers.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-bold mb-1">
            <span>4. Coupon Issues (11%)</span>
            <span>649 / mo</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-tight">
            <strong>Turnaround Action:</strong> Simplify terms; eliminate fine-print category exclusions that confuse customers at checkout.
          </p>
        </div>
      </div>

      {/* Control Bar: Filters, Search, Create Ticket */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search customer, order ID, or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none text-slate-700"
          >
            <option value="all">All Complaint Categories</option>
            <option value="Delivery delay">Delivery delay</option>
            <option value="Refund">Refund</option>
            <option value="Missing product">Missing product</option>
            <option value="Coupon issue">Coupon issue</option>
            <option value="Incorrect order">Incorrect order</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'open' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Active ({openCount + inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('critical')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'critical' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              High/Critical
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'resolved' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All ({tickets.length})
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            New Ticket
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.map((t) => (
          <div
            key={t.id}
            className={`bg-white rounded-2xl p-4 border transition shadow-sm ${
              t.priority === 'Critical'
                ? 'border-rose-200 bg-rose-50/10'
                : t.status === 'Resolved'
                ? 'border-emerald-200'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                  {t.id}
                </span>
                <span className="text-xs font-bold text-slate-900">{t.customerName}</span>
                <span className="text-[11px] text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded">
                  {t.orderId}
                </span>
                <span className="text-[10px] text-slate-400">• {t.timeAgo}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    t.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : t.priority === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {t.priority} Priority
                </span>

                <select
                  value={t.status}
                  onChange={(e) => handleUpdateStatus(t.id, e.target.value as SupportTicket['status'])}
                  className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                    t.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : t.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Escalated">Escalated</option>
                </select>
              </div>
            </div>

            <div className="py-2.5">
              <div className="flex items-center space-x-2 text-xs mb-1">
                <span className="font-bold text-slate-700">Category: {t.category}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">Agent: {t.assignedAgent}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                "{t.description}"
              </p>
            </div>

            {/* Resolution Section */}
            {t.resolutionNotes && (
              <div className="mt-1 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[11px] uppercase tracking-wider block">Resolution Note</span>
                  <span className="text-slate-700">{t.resolutionNotes}</span>
                </div>
              </div>
            )}

            {/* Inline Resolve Quick Input */}
            {t.status !== 'Resolved' && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                {editingTicketId === t.id ? (
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="text"
                      placeholder="Add resolution note (e.g. Refund issued / item replaced)..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                    <button
                      onClick={() => handleSaveResolution(t.id)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                      Save & Resolve
                    </button>
                    <button
                      onClick={() => setEditingTicketId(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 px-2"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <button
                      onClick={() => {
                        setEditingTicketId(t.id);
                        setResolutionText('');
                      }}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      Add Resolution Notes
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(t.id, 'Resolved')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      Quick Resolve (1-Click)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Log Customer Support Ticket
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Narang"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={newOrderId}
                    onChange={(e) => setNewOrderId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as SupportTicket['priority'])}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complaint Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SupportTicket['category'])}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Refund">Refund / Payment Issue</option>
                  <option value="Delivery delay">Delivery delay</option>
                  <option value="Missing product">Missing product from bag</option>
                  <option value="Coupon issue">Coupon issue at checkout</option>
                  <option value="Incorrect order">Incorrect item received</option>
                  <option value="Other">Other Operational Query</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail customer complaint..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  required
                />
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
                  Log & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
