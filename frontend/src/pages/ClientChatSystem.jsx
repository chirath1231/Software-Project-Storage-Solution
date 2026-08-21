import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Paperclip, Send, X, ArrowLeft, Info, Trash2 } from "lucide-react";
import Navbar from "../components/NavBar/NavBar";
import Sidebar from "../components/Sidebar/Sidebar";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../auth/AuthContext";
import { WS_BASE_URL } from "../config";
import api from "../api/axios";

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
  const { accessToken: token } = useAuth();

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

  // Responsive Details states
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);

  // Group chat states
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [editGroupNameVal, setEditGroupNameVal] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const wsRef = useRef(null);
  const fileInputRef = useRef(null); // ✅ For file attachments

  // Ref to hold the active conversation ID for WebSocket message handlers (avoids React stale closure)
  const selectedIdRef = useRef(selectedConversationId);
  useEffect(() => {
    selectedIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  // ----------------- Handle Attachments -----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file);
      // TODO: Call your Upload API here
    }
  };

  const currentUsername =
    sessionStorage.getItem("username") || localStorage.getItem("username") || "";

  const currentUserId = sessionStorage.getItem("user_id") || localStorage.getItem("user_id") || "";

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

    if (selectedConversation.is_group) {
      return {
        id: selectedConversation.id,
        isGroup: true,
        name: selectedConversation.name || "Group Chat",
        adminId: selectedConversation.admin_id,
        avatar: "👥",
        online: false,
        lastActive: "",
        recentFiles: selectedConversation.recent_files || [],
        preview: selectedConversation.last_message?.text || selectedConversation.preview || "",
        unread: selectedConversation.unread_count || 0,
        participants: selectedConversation.participants || [],
      };
    }

    const other = selectedConversation.other_user || {};
    return {
      id: other.id ?? selectedConversation.id,
      isGroup: false,
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
      lastActive: other.last_active || (Boolean(other.is_online) ? "Online" : "Offline"),
      recentFiles: selectedConversation.recent_files || [],
      preview:
        selectedConversation.last_message?.text ||
        selectedConversation.preview ||
        "",
      unread: selectedConversation.unread_count || 0,
      participants: selectedConversation.participants || [],
    };
  }, [selectedConversation]);

  useEffect(() => {
    setShowDetailsMobile(false);
  }, [selectedConversationId]);

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

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      let res;
      try {
        res = await api.get("/chat/users/");
      } catch {
        res = await api.get("/conversations/users/");
      }
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

  // ----------------- Group Chat Functions -----------------
  const handleCreateGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return alert("Please enter a group name");
    if (selectedGroupMembers.length === 0) return alert("Please select at least one member to add");

    try {
      const res = await api.post("/conversations/group/create/", {
        name,
        user_ids: selectedGroupMembers,
      });
      setShowNewGroupModal(false);
      setNewGroupName("");
      setSelectedGroupMembers([]);
      setGroupSearchQuery("");
      await loadConversations();
      setSelectedConversationId(res.data?.conversation_id);
    } catch (err) {
      console.error("Failed to create group:", err);
      alert(err.response?.data?.detail || "Failed to create group");
    }
  };

  const handleRenameGroup = async () => {
    const name = editGroupNameVal.trim();
    if (!name) return;
    try {
      await api.post(`/conversations/group/${selectedConversationId}/rename/`, { name });
      setIsEditingGroupName(false);
      await loadConversations();
    } catch (err) {
      console.error("Failed to rename group:", err);
      alert(err.response?.data?.detail || "Failed to rename group");
    }
  };

  const handleAddGroupMember = async (memberId) => {
    if (!memberId) return;
    try {
      await api.post(`/conversations/group/${selectedConversationId}/add/`, {
        user_ids: [memberId],
      });
      setShowAddMemberDropdown(false);
      await loadConversations();
    } catch (err) {
      console.error("Failed to add member:", err);
      alert(err.response?.data?.detail || "Failed to add member");
    }
  };

  const handleRemoveGroupMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await api.post(`/conversations/group/${selectedConversationId}/remove/`, {
        user_id: memberId,
      });
      await loadConversations();
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert(err.response?.data?.detail || "Failed to remove member");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || String(messageId).startsWith("temp-")) {
      alert("Please wait a moment for the message to sync before deleting.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/messages/${messageId}/delete/`);
      setMessages((prev) =>
        prev.filter((m) => String(m.id) !== String(messageId))
      );
      loadConversations();
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert(err.response?.data?.detail || "Failed to delete message");
    }
  };

  useEffect(() => {
    loadConversations();
    loadUsers();
  }, []);
  // ----------------- Load Conversations on mount -----------------
  useEffect(() => {
    loadConversations();
    loadUsers();
    // eslint-disable-next-line
  }, []);

  // ----------------- Global WebSocket Connection -----------------
  useEffect(() => {
    if (!token) {
      console.warn("No JWT token found. WebSocket will not connect.");
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/chat/?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("WS connected globally:", wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 1. Handle status updates
        if (data.type === "status_update") {
          setConversations((prev) =>
            prev.map((c) => {
              const isMatch = c.other_user?.id && data.user_id && Number(c.other_user.id) === Number(data.user_id);
              return isMatch
                ? {
                    ...c,
                    other_user: {
                      ...c.other_user,
                      is_online: data.is_online,
                      last_active: data.is_online ? "Online" : "Offline",
                    },
                  }
                : c;
            })
          );
          return;
        }

        // 3. Handle group updates
        if (data.type === "group_update") {
          loadConversations();
          return;
        }

        // 4. Handle message deletion
        if (data.type === "message_deleted") {
          const deletedId = data.message_id;
          if (deletedId) {
            setMessages((prev) =>
              prev.filter((m) => String(m.id) !== String(deletedId))
            );
          }
          loadConversations();
          return;
        }

        // 2. Handle chat messages
        if (data.type === "chat_message") {
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

          // If the message is for the currently active conversation, append it in real-time
          const isMsgForActive = data.conversation && selectedIdRef.current && Number(data.conversation) === Number(selectedIdRef.current);
          if (isMsgForActive) {
            setMessages((prev) => {
              if (data.client_id) {
                const idx = prev.findIndex((m) => String(m.id) === String(data.client_id));
                if (idx !== -1) {
                  const copy = [...prev];
                  copy[idx] = { ...incoming, id: data.id || incoming.id };
                  return copy;
                }
              }
              if (incoming.id && prev.some((m) => String(m.id) === String(incoming.id))) return prev;
              return [...prev, incoming];
            });
          }

          // Update sidebar conversations list (move to top, set last message, increment unread if not selected)
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id && data.conversation && Number(c.id) === Number(data.conversation)) {
                const isCurrent = selectedIdRef.current && Number(c.id) === Number(selectedIdRef.current);
                return {
                  ...c,
                  last_message: {
                    text: incomingText,
                    timestamp: incoming.timestamp,
                  },
                  unread_count: isCurrent ? 0 : (c.unread_count || 0) + (incoming.is_mine ? 0 : 1),
                };
              }
              return c;
            });
            // Sort conversations (newest message first)
            return updated.sort(
              (a, b) =>
                new Date(b.last_message?.timestamp || 0) -
                new Date(a.last_message?.timestamp || 0)
            );
          });
        }
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
  }, [currentUsername, token]);

  // ----------------- Load Messages for selected conversation -----------------
  useEffect(() => {
    if (!selectedConversationId) return;

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

    // Local reset of unread count for this selected conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversationId ? { ...c, unread_count: 0 } : c
      )
    );
  }, [selectedConversationId]);

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
      wsRef.current.send(
        JSON.stringify({
          conversation_id: selectedConversationId,
          text,
          client_id: tempId,
        })
      );
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
    if (!q) return users;
    return users.filter((u) => {
      const uname = (u.username || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const fname = (u.first_name || "").toLowerCase();
      const lname = (u.last_name || "").toLowerCase();
      const fullName = `${fname} ${lname}`.trim();
      return uname.includes(q) || email.includes(q) || fullName.includes(q);
    });
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
          <div className={`${selectedConversationId ? "hidden" : "flex w-full"} md:flex md:w-80 bg-white border-r border-gray-200 flex-col shadow-lg`}>
            {/* Header + Unified Search */}
            <div className="p-7 border-b border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Chats</h2>
                <button
                  onClick={() => {
                    setShowNewGroupModal(true);
                    setSelectedGroupMembers([]);
                    setNewGroupName("");
                    setGroupSearchQuery("");
                  }}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  👥 New Group
                </button>
              </div>
              <div className="relative">

                {!search && (
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                {/* Input */}
                <input
                  type="text"
                  placeholder="Search users or chats..."
                  value={search}
                  onFocus={() => loadUsers()}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (!users || users.length === 0) loadUsers();
                  }}
                  className={`w-full ${search ? "pl-4" : "pl-5"
                    } pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500`}
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setShowNewChat(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Conversations & Search Results List */}
            <div className="flex-1 overflow-y-auto">
              {search.trim().length > 0 ? (
                <>
                  {/* 1. All Matching Registered Database Users (Shown First when Searching) */}
                  <div className="p-3">
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Users</p>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            startChatWithUser(u.id);
                            setSearch("");
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-orange-50/70 transition-colors group border border-transparent hover:border-orange-200 mb-1"
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
                            {u.username?.[0]?.toUpperCase() || "👤"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 truncate">{u.username}</h3>
                            <p className="text-xs text-gray-500 truncate">{u.email || "Registered User"}</p>
                          </div>
                          <span className="text-xs font-bold text-orange-500 bg-orange-100 group-hover:bg-orange-500 group-hover:text-white px-2.5 py-1 rounded-lg transition-colors">
                            + Chat
                          </span>
                        </div>
                      ))
                    ) : (
                      filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-gray-400">
                          <p className="text-sm font-medium">No registered users found</p>
                          <p className="text-xs mt-1">Try searching with a different name or email.</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* 2. Matching Existing Chats */}
                  {filteredConversations.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Existing Chats</p>
                      {filteredConversations.map((conv) => {
                        const other = conv.other_user || {};
                        const isSelected = selectedConversationId === conv.id;
                        const name = conv.is_group
                          ? (conv.name || "Group Chat")
                          : (other.full_name || other.username || other.email || `Conversation #${conv.id}`);
                        const avatar = conv.is_group ? "👥" : (other.avatar_emoji || "👤");
                        const online = !conv.is_group && Boolean(other.is_online);
                        const preview = conv.last_message?.text || "";

                        return (
                          <div
                            key={conv.id}
                            onClick={() => { setSelectedConversationId(conv.id); setSearch(""); }}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-orange-400 text-white" : "hover:bg-gray-50 text-gray-800"}`}
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-xl">
                                {avatar}
                              </div>
                              {online && (
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-gray-900"}`}>{name}</h3>
                              <p className={`text-xs truncate ${isSelected ? "text-white/80" : "text-gray-500"}`}>{preview}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Active Conversations */}
                  {conversations.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent Chats</p>
                      {conversations.map((conv) => {
                        const other = conv.other_user || {};
                        const isSelected = selectedConversationId === conv.id;

                        const name = conv.is_group
                          ? (conv.name || "Group Chat")
                          : (other.full_name || other.username || other.email || `Conversation #${conv.id}`);
                        const avatar = conv.is_group ? "👥" : (other.avatar_emoji || "👤");
                        const online = !conv.is_group && Boolean(other.is_online);
                        const preview = conv.last_message?.text || "";
                        const unread = conv.unread_count || 0;

                        return (
                          <div
                            key={conv.id}
                            onClick={() => setSelectedConversationId(conv.id)}
                            className={`flex items-center gap-3 p-4 cursor-pointer rounded-xl transition-colors ${isSelected ? "bg-orange-400 text-white" : "hover:bg-gray-50"}`}
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
                              <h3 className={`font-semibold truncate ${isSelected ? "text-white" : "text-gray-900"}`}>{name}</h3>
                              <p className={`text-sm truncate ${isSelected ? "text-white/80" : "text-gray-500"}`}>{preview}</p>
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

                  {/* Registered Database Users */}
                  <div className="p-3">
                    <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">All Registered Users</p>
                    {users.length > 0 ? (
                      users.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => startChatWithUser(u.id)}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-orange-50/70 transition-colors group border border-transparent hover:border-orange-200 mb-1"
                        >
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-lg font-bold">
                            {u.username?.[0]?.toUpperCase() || "👤"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-orange-600 truncate">{u.username}</h3>
                            <p className="text-xs text-gray-500 truncate">{u.email || "Registered User"}</p>
                          </div>
                          <span className="text-xs font-bold text-orange-500 bg-orange-100 group-hover:bg-orange-500 group-hover:text-white px-2.5 py-1 rounded-lg transition-colors">
                            + Chat
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 px-3 py-2">No registered users found in database.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>


          {/* Chat Area */}
          <div className={`${selectedConversationId ? "flex-1 flex" : "hidden"} md:flex md:flex-1 flex-col bg-white`}>
            {/* Chat Header */}
            <div className="bg-orange-100 p-6 flex items-center justify-between">
              {selectedClient ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Mobile Back Button */}
                  <button 
                    onClick={() => setSelectedConversationId(null)}
                    className="md:hidden mr-2 p-1.5 rounded hover:bg-orange-200 text-gray-700 transition flex-shrink-0"
                    title="Back to list"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-2xl">
                      {selectedClient.avatar}
                    </div>
                    {selectedClient.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold text-gray-900 truncate">{selectedClient.name}</h2>
                    <p className="text-sm text-gray-600 truncate">
                      {selectedClient.isGroup
                        ? `${selectedClient.participants.length} members`
                        : (selectedClient.online ? "Online" : "Offline")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700">Select a conversation</div>
              )}

              {selectedClient && (
                <button 
                  onClick={() => setShowDetailsMobile(true)}
                  className="md:hidden text-gray-600 hover:text-orange-600 p-2 rounded hover:bg-orange-200 transition-colors flex-shrink-0"
                  title="View details"
                >
                  <Info className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4" >

              {messages.map((m) => {
                const isMine =
                  m.is_mine === true ||
                  (m.sender_username && m.sender_username === currentUsername);

                return (
                  <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} group`} >

                    <div
                      className={`max-w-md rounded-2xl p-4 relative ${isMine
                        ? "bg-gradient-to-br from-orange-400 to-yellow-400 text-white shadow-lg"
                        : "bg-white shadow-lg text-gray-900"
                        }`}
                    >
                      <p className={isMine ? "text-white" : "text-gray-900"}>{m.text}</p>
                      <div className="flex items-center justify-between gap-3 mt-2">
                        {isMine && m.id && !String(m.id).startsWith("temp-") && (
                          <button
                            onClick={() => handleDeleteMessage(m.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/80 hover:text-red-200 p-0.5 rounded cursor-pointer"
                            title="Delete message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <p className={`text-xs ${isMine ? "text-white/80" : "text-gray-500"} ml-auto`}>
                          {formatTime(m.timestamp)}
                        </p>
                      </div>

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

                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>

              </div>

            </div>
          </div>

          {/* Details Sidebar/Drawer */}
          {selectedClient && (
            <>
              {/* Mobile Drawer Overlay Backdrop */}
              {showDetailsMobile && (
                <div 
                  className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
                  onClick={() => setShowDetailsMobile(false)}
                />
              )}

              {/* Sidebar/Drawer Container */}
              <div className={`
                fixed md:static inset-y-0 right-0 z-50 w-80 max-w-[85%] bg-orange-50 shadow-lg p-6 overflow-y-auto transition-transform duration-300 ease-in-out md:transition-none
                ${showDetailsMobile ? "translate-x-0" : "translate-x-full md:translate-x-0"}
                md:flex md:flex-col md:mr-10
              `}>
                
                {/* Mobile Drawer Header */}
                <div className="flex md:hidden justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Client Details</h3>
                  <button onClick={() => setShowDetailsMobile(false)} className="text-gray-500 hover:text-red-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Details Contents */}
                <div className="flex flex-col items-center text-center mb-6 w-full">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center text-5xl border-4 border-white shadow-lg">
                      {selectedClient.avatar}
                    </div>
                    {selectedClient.online && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white"></div>
                    )}
                  </div>

                  {selectedClient.isGroup && isEditingGroupName ? (
                    <div className="flex items-center gap-2 mt-2 w-full justify-center px-4">
                      <input
                        type="text"
                        value={editGroupNameVal}
                        onChange={(e) => setEditGroupNameVal(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-3/4 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        placeholder="Group Name"
                      />
                      <button
                        onClick={handleRenameGroup}
                        className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingGroupName(false)}
                        className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center">
                      <h2 className="text-2xl font-bold text-gray-900 truncate max-w-[200px]">{selectedClient.name}</h2>
                      {selectedClient.isGroup && selectedClient.isAdmin && (
                        <button
                          onClick={() => {
                            setIsEditingGroupName(true);
                            setEditGroupNameVal(selectedClient.name);
                          }}
                          className="text-xs text-orange-500 hover:text-orange-600 underline cursor-pointer"
                          title="Rename group"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  )}

                  {selectedClient.isGroup ? (
                    <p className="text-xs text-orange-500 font-bold uppercase mt-1">
                      {selectedClient.isAdmin ? "👑 Group Admin" : "👥 Group Member"}
                    </p>
                  ) : (
                    <>
                      {selectedClient.phone && <p className="text-sm text-gray-600 mt-1">{selectedClient.phone}</p>}
                      {selectedClient.language && <p className="text-sm text-gray-600 mt-2">{selectedClient.language}</p>}
                    </>
                  )}
                </div>

                <hr className="border-gray-300 my-4" />

                <div className="space-y-4">
                  {selectedClient.isGroup ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 text-left">Members ({selectedClient.participants.length}):</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {selectedClient.participants.map((member) => {
                          const isMe = Number(member.id) === Number(currentUserId);
                          return (
                            <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">
                                    {member.avatar_emoji || "👤"}
                                  </div>
                                  {member.is_online && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
                                  )}
                                </div>
                                <div className="text-left min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {member.username} {isMe && "(You)"}
                                  </p>
                                  {member.is_admin && (
                                    <span className="text-[10px] text-orange-500 font-semibold uppercase">Admin</span>
                                  )}
                                </div>
                              </div>
                              {selectedClient.isAdmin && !isMe && (
                                <button
                                  onClick={() => handleRemoveGroupMember(member.id)}
                                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded font-semibold transition cursor-pointer"
                                  title="Remove member"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Member Search Panel */}
                      {selectedClient.isAdmin && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <h4 className="text-xs font-bold text-gray-700 uppercase mb-2 text-left">Add Member:</h4>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search username..."
                              value={memberSearchQuery}
                              onChange={(e) => setMemberSearchQuery(e.target.value)}
                              className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                            />
                            {memberSearchQuery.trim() && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto z-[60]">
                                {users
                                  .filter(
                                    (u) =>
                                      !selectedClient.participants.some((p) => Number(p.id) === Number(u.id)) &&
                                      (u.username || "").toLowerCase().includes(memberSearchQuery.toLowerCase())
                                  )
                                  .map((u) => (
                                    <div
                                      key={u.id}
                                      onClick={() => {
                                        handleAddGroupMember(u.id);
                                        setMemberSearchQuery("");
                                      }}
                                      className="p-2 text-sm text-left hover:bg-orange-50 cursor-pointer text-orange-600 font-medium border-b border-gray-100 last:border-0"
                                    >
                                      + Add {u.username}
                                    </div>
                                  ))}
                                {users.filter(
                                  (u) =>
                                    !selectedClient.participants.some((p) => Number(p.id) === Number(u.id)) &&
                                    (u.username || "").toLowerCase().includes(memberSearchQuery.toLowerCase())
                                ).length === 0 && (
                                  <div className="p-2 text-xs text-gray-500 text-center">No users match query</div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Status:</h3>
                        <p className="text-gray-700">
                          {selectedClient.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>      {/* New Group Chat Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative border border-gray-100">
            <button
              onClick={() => setShowNewGroupModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold text-gray-950 mb-4 flex items-center gap-2">
              👥 Create New Group Chat
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Discussion"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Members
                </label>

                {/* Selected members pill display */}
                {selectedGroupMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3 max-h-24 overflow-y-auto p-1.5 border border-dashed border-orange-200 rounded-lg bg-orange-50/20">
                    {selectedGroupMembers.map((id) => {
                      const user = users.find((u) => u.id === id);
                      if (!user) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                        >
                          {user.username}
                          <button
                            type="button"
                            onClick={() => setSelectedGroupMembers((prev) => prev.filter((mid) => mid !== id))}
                            className="hover:text-orange-200 text-white cursor-pointer ml-1 font-bold text-sm leading-none"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Search members to add..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 mb-2 text-sm bg-white"
                />
                
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto p-2 bg-gray-50 space-y-2">
                  {groupSearchQuery.trim() === "" ? (
                    <p className="text-xs text-gray-500 p-3 text-center">
                      Type in the search box above to find and add members.
                    </p>
                  ) : (
                    (() => {
                      const filtered = users.filter((u) =>
                        (u.username || "").toLowerCase().includes(groupSearchQuery.toLowerCase())
                      );
                      if (filtered.length === 0) {
                        return (
                          <p className="text-xs text-gray-500 p-3 text-center">
                            No matching users found.
                          </p>
                        );
                      }
                      return filtered.map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center gap-3 p-2 bg-white rounded border border-gray-150 shadow-sm cursor-pointer hover:bg-orange-50/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedGroupMembers.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGroupMembers((prev) => [...prev, u.id]);
                              } else {
                                setSelectedGroupMembers((prev) =>
                                  prev.filter((id) => id !== u.id)
                                );
                              }
                            }}
                            className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {u.username}
                          </span>
                        </label>
                      ));
                    })()
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition cursor-pointer shadow-md"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New 1-on-1 Chat Modal */}


    </div>
  );
};

export default ClientChatSystem;