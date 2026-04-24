import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    // --- NEW: Pagination States ---
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    const fetchGlobalNotifications = async (sortBy = 'newest', pageUrl = null) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;
            
            // If we click "Next Page", use that URL. Otherwise, build the default one with our sort rule!
            const targetUrl = pageUrl || `/api/auth/notifications/?sort=${sortBy}`;
            
            const res = await api.get(targetUrl);
            
            // --- NEW: Extract data from Django's Paginator ---
            setNotifications(res.data.results); 
            setUnreadCount(res.data.unread_count); // Perfectly accurate bell count!
            setNextPageUrl(res.data.next);
            setPrevPageUrl(res.data.previous);
            
        } catch (err) {
            console.error("Error fetching global notifications", err);
        }
    };

    useEffect(() => {
        fetchGlobalNotifications();
    }, []);

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            fetchGlobalNotifications, 
            setNotifications, 
            nextPageUrl,
            prevPageUrl
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);