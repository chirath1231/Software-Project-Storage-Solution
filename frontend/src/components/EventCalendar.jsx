import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api/axios"; // Your existing Axios setup
import { Plus, X } from "lucide-react";

// Setup for the Calendar to understand days and months
const locales = {
  "en-US": require("date-fns/locale/en-US"),
};
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form state for scheduling a meeting
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    meeting_link: ""
  });

  // Fetch events when the component loads
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/api/accounts/events/");
      // React Big Calendar needs 'start' and 'end' to be actual JavaScript Date objects
      const formattedEvents = response.data.map(event => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      // Send data to your new Django API
      const response = await api.post("/api/accounts/events/", newEvent);
      
      // Update the calendar instantly without refreshing the page
      setEvents([...events, {
        ...response.data,
        start: new Date(response.data.start_time),
        end: new Date(response.data.end_time),
      }]);
      
      // Close modal and reset form
      setShowModal(false);
      setNewEvent({ title: "", description: "", start_time: "", end_time: "", meeting_link: "" });
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      alert("Failed to schedule meeting. Please check your times.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Schedule</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition"
        >
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      {/* The Actual Calendar */}
      <div className="h-[500px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%", fontFamily: "inherit" }}
          eventPropGetter={(event) => ({
            style: { backgroundColor: "#f97316", border: "none", borderRadius: "4px" } // CEYNOA Orange
          })}
        />
      </div>

      {/* Schedule Meeting Pop-up Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Schedule a Meeting</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleMeeting} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Meeting Title"
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Guest Email (Optional)</label>
                <input
                    type="email"
                    placeholder="colleague@example.com"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    value={newEvent.attendee_email}
                    onChange={(e) => setNewEvent({...newEvent, attendee_email: e.target.value})}
                />
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                    value={newEvent.end_time}
                    onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})}
                  />
                </div>
              </div>
              <input
                type="url"
                placeholder="Meeting Link (Zoom, Meet, etc.)"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                value={newEvent.meeting_link}
                onChange={(e) => setNewEvent({...newEvent, meeting_link: e.target.value})}
              />
              <textarea
                placeholder="Description / Agenda"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              ></textarea>
              
              <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition">
                Save to Calendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}