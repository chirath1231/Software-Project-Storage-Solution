import React from "react";

export default function AdminTickets() {
  // Dummy data for tickets
  const tickets = [
    { id: 1, user: "user1@example.com", subject: "File upload issue", status: "Open", lastUpdate: "2 hours ago" },
    { id: 2, user: "user2@example.com", subject: "Subscription question", status: "Answered", lastUpdate: "1 day ago" },
    { id: 3, user: "user3@example.com", subject: "Cannot login", status: "Closed", lastUpdate: "3 days ago" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Support <span className="text-orange-500">Tickets</span>
        </h1>
        <p className="text-gray-500 mt-1">
          View and respond to user support requests.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        {/* Filters and Search */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
              <option>Status: All</option>
              <option>Status: Open</option>
              <option>Status: Answered</option>
              <option>Status: Closed</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search tickets..."
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          />
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="pb-2 font-medium">Ticket ID</th>
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Subject</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Last Update</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="py-3 font-mono text-gray-500">#{ticket.id}</td>
                  <td className="py-3 text-gray-700">{ticket.user}</td>
                  <td className="py-3 font-medium text-gray-800">{ticket.subject}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ticket.status === "Open" ? "bg-red-100 text-red-700" :
                      ticket.status === "Answered" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{ticket.lastUpdate}</td>
                  <td className="py-3">
                    <button className="text-orange-500 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}