import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const [nextPageUrl, setNextPageUrl] = useState(null);
    const [prevPageUrl, setPrevPageUrl] = useState(null);

    const fetchGlobalNotifications = async (sortBy = 'newest', pageUrl = null) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) return;
            
            
            const targetUrl = pageUrl || `/api/accounts/notifications/?sort=${sortBy}`;
            
            const res = await api.get(targetUrl);
            
            // Extract data from Django's PageNumberPagination response
            setNotifications(res.data.results); 
            setUnreadCount(res.data.unread_count); 
            setNextPageUrl(res.data.next);
            setPrevPageUrl(res.data.previous);
            
        } catch (err) {
            console.error("Error fetching global notifications", err);
        }
    };

    useEffect(() => {
        // Only fetch if a token exists to avoid unnecessary 401s on mount
        if (localStorage.getItem("access_token")) {
            fetchGlobalNotifications();
        }
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