import React, { useState, useEffect } from "react";
import { Calendar, Clock, Video } from "lucide-react";
import { Link } from "react-router-dom"; 

export default function UpcomingMeetingsWidget() {
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingMeetings();
  }, []);

  const fetchUpcomingMeetings = async () => {
    try {
      const token = localStorage.getItem("access_token"); 
      
      const response = await fetch("http://localhost:8000/api/accounts/events/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();

      const now = new Date();
      const upcoming = data
        .filter(event => new Date(event.end_time) > now)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
        .slice(0, 3);

      setMeetings(upcoming);
    } catch (err) {
      console.error("Could not load widget data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 flex flex-col h-full items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 flex flex-col h-full min-h-[300px]">
      
      {/* Header - Now perfectly matches the Recent Files card */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Upcoming Meetings</h2>
          {meetings.length > 0 && (
            <span className="bg-orange-100 text-orange-600 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
              {meetings.length} Left
            </span>
          )}
        </div>
        {/* Make sure the 'to' path matches wherever your Command Center/Calendar is located! */}
        <Link to="/dashboard/notifications" className="text-sm font-medium text-orange-500 hover:text-orange-600 transition">
          View Calendar →
        </Link>
      </div>

      {/* Body */}
      {meetings.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center py-6 text-gray-400">
          <Calendar size={40} className="text-gray-300 mb-3" />
          <p>No upcoming meetings.</p>
          <p className="text-xs mt-1">You are all caught up!</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          {meetings.map((meeting) => {
            const startDate = new Date(meeting.start_time);
            const timeString = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isToday = startDate.toDateString() === new Date().toDateString();
            const dateString = isToday ? "Today" : startDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div 
                key={meeting.id} 
                className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-200 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-semibold text-gray-800 pr-2 truncate">{meeting.title}</h4>
                  
                  {meeting.meeting_link && (
                    <a 
                      href={meeting.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-shrink-0 bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white p-1.5 rounded-lg transition-colors"
                      title="Join Meeting"
                    >
                      <Video size={16} />
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-orange-400"/> {dateString}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-400"/> {timeString}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}