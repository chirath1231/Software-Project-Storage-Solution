import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, Clock, Send, X, Loader2 } from 'lucide-react';
import api from '../api/axios';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      let res;
      try {
        res = await api.get('/api/tickets/tickets/');
      } catch (e) {
        res = await api.get('/api/tickets/');
      }
      const rawData = res.data;
      const data = Array.isArray(rawData) ? rawData : (rawData?.results || []);
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Open';
    const s = String(status).toUpperCase();
    if (s === 'CLOSED' || s === 'RESOLVED') return 'Resolved';
    if (s === 'IN_PROGRESS' || s === 'PENDING') return 'Pending';
    return 'Open';
  };

  const getStatusStyle = (status) => {
    const label = getStatusLabel(status);
    switch (label) {
      case 'Open': return 'bg-red-100 text-red-600 border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityWeight = (priority) => {
    if (!priority) return 2;
    const p = String(priority).toUpperCase();
    if (p === 'HIGH' || p === 'CRITICAL') return 3;
    if (p === 'MEDIUM') return 2;
    if (p === 'LOW') return 1;
    return 2;
  };

  const getPriorityStyle = (priority) => {
    const p = String(priority || 'MEDIUM').toUpperCase();
    if (p === 'HIGH' || p === 'CRITICAL') return 'bg-red-100 text-red-600 border border-red-200';
    if (p === 'MEDIUM') return 'bg-orange-100 text-orange-600 border border-orange-200';
    return 'bg-green-100 text-green-600 border border-green-200';
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setActionLoading(true);
    try {
      await api.patch(`/api/tickets/tickets/${ticketId}/`, { status: newStatus });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/tickets/tickets/${selectedTicket.id}/`, { status: 'CLOSED' });
      alert(`Response recorded for ticket! Ticket marked as Resolved.`);
      setReply('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (err) {
      console.error("Failed to process reply:", err);
      alert("Failed to update ticket.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets
    .filter(t => {
      const nameStr = t.name || t.email || '';
      const titleStr = t.title || '';
      const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            titleStr.toLowerCase().includes(searchTerm.toLowerCase());
      const label = getStatusLabel(t.status);
      const matchesFilter = filterStatus === 'All' || label === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => getStatusLabel(t.status) === 'Open').length,
    resolved: tickets.filter(t => getStatusLabel(t.status) === 'Resolved').length
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Support Tickets...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-10 bg-orange-500 rounded-md"></div>
        <h1 className="text-3xl font-bold text-gray-800">Support Management</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Total Tickets</p>
            <h3 className="text-3xl font-black text-gray-700">{stats.total}</h3>
          </div>
          <MessageSquare className="text-blue-100" size={48} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Open Tickets</p>
            <h3 className="text-3xl font-black text-gray-700">{stats.open}</h3>
          </div>
          <Clock className="text-red-100" size={48} />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase">Resolved Tickets</p>
            <h3 className="text-3xl font-black text-gray-700">{stats.resolved}</h3>
          </div>
          <CheckCircle className="text-green-100" size={48} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Action Bar */}
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4 bg-white">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by Name or Problem Title..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-400" />
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['All', 'Open', 'Resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    filterStatus === status ? 'bg-white shadow-md text-orange-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-widest font-black">
                <th className="px-8 py-4">User Name</th>
                <th className="px-8 py-4">Priority</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Problem Title</th>
                <th className="px-8 py-4">Date</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-5 font-bold text-gray-700">{ticket.name || ticket.email || 'User'}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase">{ticket.category || 'General'}</td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-800 text-sm">{ticket.title}</div>
                      {ticket.description && (
                        <div className="text-xs text-gray-400 max-w-sm truncate mt-0.5" title={ticket.description}>
                          {ticket.description}
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-gray-700 font-bold text-sm">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusStyle(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 font-medium">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail Modal/Panel */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-gray-800">Support Ticket Details</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">User Name</label>
                  <p className="font-bold text-gray-800">{selectedTicket.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                  <p className="font-bold text-gray-800">{selectedTicket.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Priority</label>
                  <span className="font-bold text-orange-600 uppercase text-xs">{selectedTicket.priority || 'MEDIUM'}</span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${getStatusStyle(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex gap-3">
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'OPEN')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                    getStatusLabel(selectedTicket.status) === 'Open'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'
                  }`}
                >
                  Mark Open
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'IN_PROGRESS')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                    getStatusLabel(selectedTicket.status) === 'Pending'
                      ? 'bg-yellow-500 text-white border-yellow-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400'
                  }`}
                >
                  Mark In Progress
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedTicket.id, 'CLOSED')}
                  className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                    getStatusLabel(selectedTicket.status) === 'Resolved'
                      ? 'bg-green-500 text-white border-green-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                  }`}
                >
                  Mark Resolved
                </button>
              </div>

              {/* Problem Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                  <h3 className="font-black text-gray-800 uppercase text-xs tracking-tighter">Issue Title: {selectedTicket.title}</h3>
                </div>
                <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl italic text-gray-700 leading-relaxed shadow-inner">
                  "{selectedTicket.description}"
                </div>
              </div>
            </div>

            {/* Reply Section */}
            <div className="p-8 border-t border-gray-100 bg-gray-50">
              <form onSubmit={handleSendReply} className="space-y-4">
                <label className="font-black text-gray-500 uppercase text-[10px] tracking-widest ml-1">Your Reply</label>
                <textarea 
                  rows="4" 
                  placeholder="Type your response to the user here..."
                  className="w-full p-4 rounded-2xl border-2 border-white bg-white shadow-sm focus:border-orange-500 outline-none transition-all resize-none"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                ></textarea>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50"
                >
                  <Send size={18} />
                  {actionLoading ? "Processing..." : "Send Reply & Resolve Ticket"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
