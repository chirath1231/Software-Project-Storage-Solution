import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import api from "../api/axios";

import { useAuth } from "../auth/AuthContext";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);

  const { token } = useAuth();

  const fetchGlobalNotifications = async (sortBy = "newest", pageUrl = null) => {
    try {
      const currentToken = token || localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      if (!currentToken) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const url = pageUrl
        ? pageUrl // FULL URL from Django pagination
        : `/api/accounts/notifications/?sort=${sortBy}`;

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
    const currentToken = token || localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
    if (currentToken) {
      fetchGlobalNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setNextPageUrl(null);
      setPrevPageUrl(null);
    }
  }, [token]);

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