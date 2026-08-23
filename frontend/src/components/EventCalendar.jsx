import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "../api/axios"; 
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

// --- IMPORT THE GLOBAL BRAIN ---
import { useNotifications } from '../context/NotificationContext';

// Setup for the Calendar
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

// --- MODERN CUSTOM TOOLBAR ---
const CustomToolbar = (toolbar) => {
  const goToBack = () => toolbar.onNavigate('PREV');
  const goToNext = () => toolbar.onNavigate('NEXT');
  const goToCurrent = () => toolbar.onNavigate('TODAY');

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
      <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
        <button onClick={goToCurrent} className="px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
          Today
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button onClick={goToBack} className="p-1 text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm rounded-md transition-all">
          <ChevronLeft size={18} />
        </button>
        <button onClick={goToNext} className="p-1 text-gray-500 hover:bg-white hover:text-gray-800 hover:shadow-sm rounded-md transition-all">
          <ChevronRight size={18} />
        </button>
      </div>

      <h2 className="text-lg font-bold text-gray-800 tracking-tight">
        {toolbar.label}
      </h2>

      <div className="flex items-center p-1 bg-gray-100 rounded-lg border border-gray-200">
        {['month', 'week', 'day', 'agenda'].map((viewName) => (
          <button
            key={viewName}
            onClick={() => toolbar.onView(viewName)}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-all capitalize ${
              toolbar.view === viewName ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {viewName}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function EventCalendar({ onMeetingScheduled }) {
  const { fetchGlobalNotifications } = useNotifications();
  
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Update 1: Separate the Date and Times from the main object
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    meeting_link: "",
    attendee_email: ""
  });
  
  const [meetingDate, setMeetingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get("/api/accounts/events/");
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
    
    // Update 2: Stitch the date and times together into standard ISO strings
    const payload = {
      ...newEvent,
      start_time: `${meetingDate}T${startTime}`,
      end_time: `${meetingDate}T${endTime}`
    };

    try {
      const response = await api.post("/api/accounts/events/", payload);
      
      setEvents([...events, {
        ...response.data,
        start: new Date(response.data.start_time),
        end: new Date(response.data.end_time),
      }]);
      
      setShowModal(false);
      
      // Update 3: Reset all form fields
      setNewEvent({ title: "", description: "", meeting_link: "", attendee_email: "" });
      setMeetingDate("");
      setStartTime("");
      setEndTime("");
      
      fetchGlobalNotifications();

      if (onMeetingScheduled) {
        onMeetingScheduled();
      }

    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      alert("Failed to schedule meeting. Please check your times.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 relative h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Schedule</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={3} /> Schedule Meeting
        </button>
      </div>

      <div className="h-[500px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%", fontFamily: "inherit" }}
          components={{ toolbar: CustomToolbar }}
          eventPropGetter={(event) => ({
            style: { backgroundColor: "#f97316", border: "none", borderRadius: "6px", fontWeight: "600", fontSize: "0.8rem", padding: "2px 6px" } 
          })}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Schedule Meeting</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleScheduleMeeting} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Event Title</label>
                <input
                  type="text"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Guest Email (Optional)</label>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={newEvent.attendee_email}
                  onChange={(e) => setNewEvent({...newEvent, attendee_email: e.target.value})}
                />
              </div>

              {/* Update 4: The new Date and Time layout */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Meeting Date</label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Start Time</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">End Time</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Meeting Link</label>
                <input
                  type="url"
                  placeholder="https://zoom.us/j/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={newEvent.meeting_link}
                  onChange={(e) => setNewEvent({...newEvent, meeting_link: e.target.value})}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none"
                  rows="3"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                ></textarea>
              </div>
              
              <button type="submit" className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-md transition-all">
                Save to Calendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}