import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { BASE_URL } from "../api/apiClient";

const ChatSocketContext = createContext(null);

// Single shared WebSocket connection (mirrors the web app's ws://.../ws/chat/?token=…),
// live presence, per-conversation unread counts, and a "new message" toast for
// conversations the user isn't currently looking at.
export function ChatSocketProvider({ children }) {
  const { user, isAuthed } = useAuth();
  const wsRef = useRef(null);
  const listenersRef = useRef(new Set());
  const activeConversationRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [presence, setPresence] = useState({});
  const [unread, setUnread] = useState({});
  const [toast, setToast] = useState(null);

  const setActiveConversation = useCallback((id) => {
    activeConversationRef.current = id ?? null;
    if (id != null) {
      setUnread((u) => (u[id] ? { ...u, [id]: 0 } : u));
    }
  }, []);

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  const sendMessage = useCallback((conversationId, text, clientId) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ conversation_id: conversationId, text, client_id: clientId }));
      return true;
    }
    return false;
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!isAuthed || !user?.accessToken) {
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
      setConnected(false);
      setPresence({});
      setUnread({});
      return;
    }

    let cancelled = false;
    let retryDelay = 1500;

    const connect = () => {
      if (cancelled) return;
      const wsUrl = `${BASE_URL.replace(/^http/, "ws")}/ws/chat/?token=${encodeURIComponent(user.accessToken)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryDelay = 1500;
      };

      ws.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          reconnectTimerRef.current = setTimeout(connect, retryDelay);
          retryDelay = Math.min(retryDelay * 1.6, 15000);
        }
      };

      ws.onerror = () => {
        try { ws.close(); } catch {}
      };

      ws.onmessage = (e) => {
        let data;
        try { data = JSON.parse(e.data); } catch { return; }

        if (data.type === "status_update") {
          setPresence((p) => ({ ...p, [data.user_id]: { isOnline: data.is_online, lastSeen: data.last_seen } }));
          return;
        }

        if (data.type === "group_update") {
          listenersRef.current.forEach((fn) => fn({ type: "group_update", conversationId: data.conversation_id }));
          return;
        }

        if (data.type === "chat_message") {
          const conversationId = data.conversation;
          listenersRef.current.forEach((fn) => fn({ type: "chat_message", conversationId, message: data }));

          if (activeConversationRef.current !== conversationId && data.sender !== user.id) {
            setUnread((u) => ({ ...u, [conversationId]: (u[conversationId] || 0) + 1 }));
            setToast({ conversationId, senderUsername: data.sender_username, text: data.text });
          }
        }
      };
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
    };
  }, [isAuthed, user?.accessToken, user?.id]);

  return (
    <ChatSocketContext.Provider
      value={{ connected, presence, unread, toast, dismissToast, sendMessage, subscribe, setActiveConversation }}
    >
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  const ctx = useContext(ChatSocketContext);
  if (!ctx) throw new Error("useChatSocket must be used within ChatSocketProvider");
  return ctx;
}
