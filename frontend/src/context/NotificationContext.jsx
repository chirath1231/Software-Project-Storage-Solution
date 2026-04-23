import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios'; // Make sure this path is correct for your project

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchGlobalNotifications = async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return; // Don't fetch if not logged in
            
            const res = await api.get("/api/auth/notifications/");
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            setNotifications(sorted);
            // Calculate how many are unread for the red badge!
            setUnreadCount(sorted.filter(n => !n.is_read).length);
        } catch (err) {
            console.error("Error fetching global notifications", err);
        }
    };

    // Fetch once when the user logs in/app loads
    useEffect(() => {
        fetchGlobalNotifications();
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, fetchGlobalNotifications, setNotifications, setUnreadCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);