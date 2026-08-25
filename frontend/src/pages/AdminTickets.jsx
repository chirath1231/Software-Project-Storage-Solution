import React, { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, Clock, X, RefreshCw } from 'lucide-react';
import api from '../api/axios';

function formatTimeAgo(date) {
  if (!date || isNaN(date.getTime())) return 'Recently';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/tickets/?all=true');
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);

      const formatted = data.map((t) => {
        const dateObj = new Date(t.created_at);
        const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString() : 'N/A';
        const timeAgoStr = formatTimeAgo(dateObj);

        let displayStatus = 'Open';
        if (t.status === 'CLOSED' || t.status === 'Resolved') displayStatus = 'Resolved';
        else if (t.status === 'IN_PROGRESS' || t.status === 'Pending') displayStatus = 'Pending';
        else displayStatus = 'Open';

        return {
          id: `TKT-${t.id}`,
          rawId: t.id,
          userName: t.name || t.email || 'Anonymous',
          email: t.email || 'N/A',
          title: t.title,
          category: t.category || 'General',
          priority: t.priority || 'MEDIUM',
          date: dateStr,
          timeAgo: timeAgoStr,
          status: displayStatus,
          rawStatus: t.status,
          description: t.description,
        };
      });
      setTickets(formatted);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Failed to load tickets from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateStatus = async (newRawStatus) => {
    if (!selectedTicket) return;
    try {
      setUpdatingStatus(true);
      await api.patch(`/api/tickets/${selectedTicket.rawId}/`, { status: newRawStatus });
      await fetchTickets();

      let newDisplayStatus = 'Open';
      if (newRawStatus === 'CLOSED') newDisplayStatus = 'Resolved';
      else if (newRawStatus === 'IN_PROGRESS') newDisplayStatus = 'Pending';

      setSelectedTicket((prev) => (prev ? { ...prev, rawStatus: newRawStatus, status: newDisplayStatus } : null));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      t.userName.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower) ||
      t.title.toLowerCase().includes(searchLower) ||
      t.email.toLowerCase().includes(searchLower);

    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'Open').length,
    pending: tickets.filter((t) => t.status === 'Pending').length,
    resolved: tickets.filter((t) => t.status === 'Resolved').length,
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Resolved':
        return 'bg-green-100 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedTicket) return;
    alert(`Reply sent to ${selectedTicket.email}: "${reply}"`);
    setReply('');
    setSelectedTicket(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 bg-orange-500 rounded-md"></div>
          <h1 className="text-3xl font-bold text-gray-800">Support Management</h1>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
              placeholder="Search by User, Email, Title or ID..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-400" />
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['All', 'Open', 'Pending', 'Resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
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
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Loading support tickets...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-medium">{error}</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-medium">No tickets found.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-widest font-black">
                  <th className="px-8 py-4">Ticket ID</th>
                  <th className="px-8 py-4">User / Email</th>
                  <th className="px-8 py-4">Problem Title</th>
                  <th className="px-8 py-4">Category / Priority</th>
                  <th className="px-8 py-4">Date / Time</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTickets.map((ticket) => (
                  <tr
                    key={ticket.rawId}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
                  >
                    <td className="px-8 py-5 font-mono font-bold text-orange-600">#{ticket.id}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-700">{ticket.userName}</span>
                        <span className="text-xs text-gray-400">{ticket.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-600 font-medium">{ticket.title}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-700">{ticket.category}</span>
                        <span className="text-[10px] uppercase font-black tracking-wider text-orange-500">{ticket.priority}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-gray-700 font-bold text-sm">{ticket.date}</span>
                        <span className="text-xs text-gray-400">{ticket.timeAgo}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black border ${getStatusStyle(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal/Panel */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-2xl bg-white h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <span className="bg-orange-100 text-orange-600 p-2 rounded-lg font-mono font-bold">#{selectedTicket.id}</span>
                <h2 className="text-xl font-black text-gray-800">Ticket Details</h2>
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
                  <p className="font-bold text-gray-800">{selectedTicket.userName}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                  <p className="font-bold text-gray-800">{selectedTicket.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Category & Priority</label>
                  <p className="font-bold text-gray-800">{selectedTicket.category} ({selectedTicket.priority})</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Status</label>
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${getStatusStyle(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Update Status Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Update Ticket Status</label>
                <div className="flex gap-3">
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('OPEN')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                      selectedTicket.rawStatus === 'OPEN' ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-200 text-gray-600 hover:border-red-400'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                      selectedTicket.rawStatus === 'IN_PROGRESS' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-400'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus('CLOSED')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs border transition-all ${
                      selectedTicket.rawStatus === 'CLOSED' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 text-gray-600 hover:border-green-400'
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-orange-500 rounded-full"></div>
                  <h3 className="font-black text-gray-800 uppercase text-xs tracking-tighter">Issue Description</h3>
                </div>
                <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-2xl italic text-gray-700 leading-relaxed shadow-inner">
                  "{selectedTicket.description}"
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
