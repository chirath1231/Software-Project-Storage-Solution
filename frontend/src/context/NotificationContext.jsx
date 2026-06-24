import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import api from "../api/axios";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);

  const fetchGlobalNotifications = async (sortBy = "newest", pageUrl = null) => {
    try {
      const url = pageUrl
        ? pageUrl // FULL URL from Django pagination
        : `/api/auth/notifications/?sort=${sortBy}`;

      const res = await api.get(url);

      setNotifications(res.data.results || []);
      setUnreadCount(res.data.unread_count || 0);
      setNextPageUrl(res.data.next);
      setPrevPageUrl(res.data.previous);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchGlobalNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchGlobalNotifications,
        nextPageUrl,
        prevPageUrl,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
};