import React, { useState } from 'react';
import { Search, Filter, MessageSquare, CheckCircle, Clock, Send, X } from 'lucide-react';

const AdminTickets = () => {
  const [tickets] = useState([
    { id: 'T123', userName: 'Mehrab Bozorgi', email: 'mehrab@example.com', title: 'Payment failure', date: '2024-03-28', timeAgo: '2 hours ago', status: 'Open', description: 'My payment failed but money deducted from my bank account. Please check this immediately.' },
    { id: 'T124', userName: 'Jane Smith', email: 'jane.smith@service.com', title: 'Storage limit error', date: '2024-03-27', timeAgo: '1 day ago', status: 'Pending', description: 'I upgraded to the Plus plan but my dashboard still shows 5GB limit.' },
    { id: 'T125', userName: 'John Doe', email: 'john.doe@gmail.com', title: 'Cannot delete file', date: '2024-03-26', timeAgo: '2 days ago', status: 'Resolved', description: 'The delete button is not working for a specific PDF file in my folder.' },
    { id: 'T126', userName: 'Alice Johnson', email: 'alice.j@outlook.com', title: 'Google Login Issue', date: '2024-03-25', timeAgo: '3 days ago', status: 'Open', description: 'I keep getting an authentication error when trying to use Google login.' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.userName.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-600 border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'Resolved': return 'bg-green-100 text-green-600 border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    alert(`Reply sent to ${selectedTicket.userName}`);
    setReply('');
    setSelectedTicket(null);
  };

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
              placeholder="Search by User or ID (e.g. #T123)..." 
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
                <th className="px-8 py-4">Ticket ID</th>
                <th className="px-8 py-4">User Name</th>
                <th className="px-8 py-4">Problem Title</th>
                <th className="px-8 py-4">Date / Time</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets.map((ticket) => (
                <tr 
                  key={ticket.id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
                >
                  <td className="px-8 py-5 font-mono font-bold text-orange-600">#{ticket.id}</td>
                  <td className="px-8 py-5 font-bold text-gray-700">{ticket.userName}</td>
                  <td className="px-8 py-5 text-gray-600 font-medium">{ticket.title}</td>
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Created Date</label>
                  <p className="font-bold text-gray-800">{selectedTicket.date} ({selectedTicket.timeAgo})</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Current Status</label>
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${getStatusStyle(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
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
                  className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95"
                >
                  <Send size={18} />
                  Send Reply to User
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