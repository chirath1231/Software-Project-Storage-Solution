import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Search, Paperclip, Send, X } from "lucide-react";
import Navbar from "../components/NavBar/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";

// ✅ one axios client (avoid URL mistakes)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// ✅ AUTO attach JWT token to every API request (SESSION STORAGE)
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // saved after login
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper: format time nicely
const formatTime = (isoOrDate) => {
  try {
    const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const ClientChatSystem = () => {
  // ----------------- State -----------------
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]); // left list
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  const [messages, setMessages] = useState([]); // middle chat messages
  const [messageInput, setMessageInput] = useState("");

  // ✅ New Chat state
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const wsRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ For file attachments

  // ----------------- Handle Attachments -----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file);
      // TODO: Call your Upload API here
    }
  };

  // Current user identity (best you currently have)
  const currentUsername =
    sessionStorage.getItem("username") || localStorage.getItem("username") || "";

  // ================= AUTO SCROLL FIX =================
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ----------------- Derived -----------------
  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const selectedClient = useMemo(() => {
    if (!selectedConversation) return null;

    const other = selectedConversation.other_user || {};
    return {
      id: other.id ?? selectedConversation.id,
      name:
        other.full_name ||
        other.username ||
        other.email ||
        `Conversation #${selectedConversation.id}`,
      username: other.username || "",
      email: other.email || "",
      phone: other.phone || "",
      language: other.language || "",
      avatar: other.avatar_emoji || "👤",
      online: Boolean(other.is_online),
      lastActive: other.last_active || "",
      recentFiles: selectedConversation.recent_files || [],
      preview:
        selectedConversation.last_message?.text ||
        selectedConversation.preview ||
        "",
      unread: selectedConversation.unread_count || 0,
    };
  }, [selectedConversation]);

  // ----------------- Helpers: Load Conversations -----------------
  const loadConversations = async () => {
    try {
      const res = await api.get("/conversations/");
      const list = res.data || [];
      setConversations(list);

      // auto-select first if none selected
      if (!selectedConversationId && list.length) {
        setSelectedConversationId(list[0].id);
      }

      return list;
    } catch (err) {
      console.error("Failed to load conversations:", err);
      return [];
    }
  };

  // ----------------- New Chat: Load users -----------------
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/chat/users/");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // ----------------- New Chat: Start conversation -----------------
  const startChatWithUser = async (otherUserId) => {
    try {
      const res = await api.post("/conversations/start/", { other_user_id: otherUserId });
      await loadConversations();
      setSelectedConversationId(res.data?.conversation_id);
      setSearch(""); // Reset search after starting
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);
  // ----------------- Load Conversations on mount -----------------
  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line
  }, []);

  // ----------------- Load Messages + WebSocket -----------------
  useEffect(() => {
    if (!selectedConversationId) return;

    const token = sessionStorage.getItem("token");
    if (!token) {
      console.warn("No JWT token found in sessionStorage. WebSocket will not connect.");
      return;
    }

    const loadMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedConversationId}/`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      }
    };

    loadMessages();

    // close old ws
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${selectedConversationId}/?token=${encodeURIComponent(
      token
    )}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("WS connected:", wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // --- NEW EDIT: Handle Status Updates ---
        if (data.type === "status_update") {
          setConversations((prev) =>
            prev.map((c) =>
              c.other_user?.id === data.user_id
                ? {
                    ...c,
                    other_user: {
                      ...c.other_user,
                      is_online: data.is_online,
                      last_active: data.is_online ? "Active now" : "Just now",
                    },
                  }
                : c
            )
          );
          return; // Stop processing this as a message
        }
        // --- END EDIT ---

        const incomingText = (data.text || "").trim();
        if (!incomingText) return;

        const incoming = {
          id: data.id ?? `ws-${Date.now()}`,
          text: incomingText,
          sender: data.sender ?? null,
          sender_username: data.sender_username ?? "Unknown",
          timestamp: data.created_at || new Date().toISOString(),
          is_mine: (data.sender_username && data.sender_username === currentUsername) || false,
        };

        // Update Message UI
        setMessages((prev) => {
          if (data.client_id) {
            const idx = prev.findIndex((m) => m.id === data.client_id);
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = incoming;
              return copy;
            }
          }
          if (incoming.id && prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });

        // Update Conversation List + SORT TO TOP
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === selectedConversationId
              ? { ...c, last_message: { text: incomingText, timestamp: incoming.timestamp }, unread_count: 0 }
              : c
          );
          // Sort by date (newest first)
          return updated.sort((a, b) => new Date(b.last_message?.timestamp || 0) - new Date(a.last_message?.timestamp || 0));
        });
      } catch (e) {
        console.error("WS message parse error:", e);
      }
    };
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (e) => console.error("WS error:", e);

    return () => {
      try {
        ws.close();
      } catch { }
    };
  }, [selectedConversationId, currentUsername]);

  // ----------------- Send Message (REALTIME FIRST) -----------------
  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text) return;
    if (!selectedConversationId) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      text,
      sender_username: currentUsername || "me",
      timestamp: new Date().toISOString(),
      is_mine: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setMessageInput("");

    // Update Conversation List (Move to top locally immediately)
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === selectedConversationId
          ? { ...c, last_message: { text, timestamp: new Date().toISOString() } }
          : c
      );
      return updated.sort((a, b) => new Date(b.last_message?.timestamp || 0) - new Date(a.last_message?.timestamp || 0));
    });

    // WebSocket send
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ text, client_id: tempId }));
      return;
    }

    // HTTP fallback
    try {
      const res = await api.post("/messages/send/", {
        conversation_id: selectedConversationId,
        text,
      });
      setMessages((prev) => prev.map((m) => (m.id === tempId ? res.data : m)));
    } catch (err) {
      console.error("Send message failed:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Message send failed.");
    }
  };

  // ----------------- Filtered list for search -----------------
  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;

    return conversations.filter((c) => {
      const other = c.other_user || {};
      const name = (other.full_name || other.username || other.email || "").toLowerCase();
      const preview = (c.last_message?.text || "").toLowerCase();
      return name.includes(q) || preview.includes(q);
    });
  }, [conversations, search]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, search]);

  // ----------------- Render -----------------
  return (
    <div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Clients
          </h1>
          <p className="text-gray-500 mt-1">Manage your clients, share files, and track activity </p>
        </div>
      </div>

      <div className="flex h-screen bg-white">

        <div className="flex flex-row mt-10 mb-5 flex-1 bg-white">

          {/* Sidebar (Clients List) */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
            {/* Header + Unified Search */}
            <div className="p-7 border-b border-gray-200 shadow-lg">
              <div className="relative">

                {!search && (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                {/* Input */}
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`w-full ${search ? "pl-4" : "pl-5"
                    } pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setShowNewChat(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {/* Search Results Panel */}
              {search.length > 0 && (
                <div className="mt-4 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">

                  {filteredConversations.length > 0 && (
                    <div className="p-2 border-b">
                      <p className="px-2 text-xs text-gray-400 font-bold uppercase">Chats</p>
                      {filteredConversations.map((c) => (
                        <div key={c.id} onClick={() => { setSelectedConversationId(c.id); setSearch(""); }} className="p-2 rounded hover:bg-gray-100 cursor-pointer text-sm">
                          {c.other_user?.username || "Chat"}
                        </div>
                      ))}
                    </div>
                  )}
                  {filteredUsers.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 text-xs text-gray-400 font-bold uppercase">People</p>
                      {filteredUsers.map((u) => (
                        <div key={u.id} onClick={() => { startChatWithUser(u.id); }} className="p-2 rounded hover:bg-orange-50 cursor-pointer text-sm text-orange-600 font-medium">
                          + Start chat with {u.username}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conversations */}
            {search.length === 0 && (
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => {
                  const other = conv.other_user || {};
                  const isSelected = selectedConversationId === conv.id;

                  const name =
                    other.full_name ||
                    other.username ||
                    other.email ||
                    `Conversation #${conv.id}`;
                  const avatar = other.avatar_emoji || "👤";
                  const online = Boolean(other.is_online);
                  const preview = conv.last_message?.text || "";
                  const unread = conv.unread_count || 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversationId(conv.id)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${isSelected ? "bg-orange-400 text-white" : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-2xl">
                          {avatar}
                        </div>
                        {online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-900"
                            }`}
                        >
                          {name}
                        </h3>
                        <p
                          className={`text-sm truncate ${isSelected ? "text-white/80" : "text-gray-500"
                            }`}
                        >
                          {preview}
                        </p>
                      </div>

                      {unread > 0 && (
                        <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {unread}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>


          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="bg-orange-100 p-6">
              {selectedClient ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-2xl">
                      {selectedClient.avatar}
                    </div>
                    {selectedClient.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                    <p className="text-sm text-gray-600">
                      {selectedClient.online ? "Active now" : selectedClient.lastActive || "Offline"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700">Select a conversation</div>
              )}
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4" >

              {messages.map((m) => {
                const isMine =
                  m.is_mine === true ||
                  (m.sender_username && m.sender_username === currentUsername);

                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`} >

                    <div
                      className={`max-w-md rounded-2xl p-4 ${isMine
                        ? "bg-gradient-to-br from-orange-400 to-yellow-400 text-white shadow-lg"
                        : "bg-white shadow-lg text-gray-900"
                        }`}
                    >
                      <p className={isMine ? "text-white" : "text-gray-900"}>{m.text}</p>
                      <p className={`text-xs mt-2 ${isMine ? "text-white/80" : "text-gray-500"} text-right`}>
                        {formatTime(m.timestamp)}
                      </p>

                    </div>

                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-6 bg-white">
              <div className="flex items-center gap-3 shadow-lg">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"

                />

                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                <button onClick={() => fileInputRef.current.click()} className="p-3 text-gray-500 hover:text-gray-700">
                  <Paperclip className="w-6 h-6" />
                </button>

                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>

              </div>

            </div>
          </div>

          {/* Client Details Sidebar */}
          <div className="w-80 bg-orange-50 shadow-lg p-6 overflow-y-auto mr-10">
            {selectedClient ? (
              <>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-5xl border-4 border-white shadow-lg">
                      {selectedClient.avatar}
                    </div>
                    {selectedClient.online && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                  {selectedClient.username && <p className="text-sm text-gray-600 mt-1">{selectedClient.username}</p>}
                  {selectedClient.email && <p className="text-sm text-gray-600">{selectedClient.email}</p>}
                  {selectedClient.phone && <p className="text-sm text-gray-600">{selectedClient.phone}</p>}
                  {selectedClient.language && <p className="text-sm text-gray-600 mt-2">{selectedClient.language}</p>}
                </div>

                <hr className="border-gray-300 my-4" />

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Last Active:</h3>
                    <p className="text-gray-700">
                      {selectedClient.lastActive || (selectedClient.online ? "Online" : "-")}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Shared:</h3>
                    <div className="space-y-2">
                      {(selectedClient.recentFiles || []).map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-700">{file}</span>
                        </div>
                      ))}
                      {(!selectedClient.recentFiles || selectedClient.recentFiles.length === 0) && (
                        <p className="text-sm text-gray-600">No recent files</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-700">No conversation selected</div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default ClientChatSystem;