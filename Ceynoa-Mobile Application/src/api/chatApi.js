import { apiGet, apiPost } from "./apiClient";

// Users available to start a chat with
export const getChatUsers = () => apiGet("/api/chat/users/");

// Conversations (1:1 + group), with last message preview
export const getConversations = () => apiGet("/api/conversations/");

// Messages for one conversation
export const getMessages = (conversationId) => apiGet(`/api/messages/${conversationId}/`);

// Send a message over REST (fallback when the socket isn't connected)
export const sendMessageRest = (conversationId, text) =>
  apiPost("/api/messages/send/", { conversation_id: conversationId, text });

// Find or create a 1:1 conversation with another user
export const startConversation = (otherUserId) =>
  apiPost("/api/conversations/start/", { other_user_id: otherUserId });

// Group chat management
export const createGroup = (name, userIds) =>
  apiPost("/api/conversations/group/create/", { name, user_ids: userIds });
export const addGroupMembers = (conversationId, userIds) =>
  apiPost(`/api/conversations/group/${conversationId}/add/`, { user_ids: userIds });
export const removeGroupMember = (conversationId, userId) =>
  apiPost(`/api/conversations/group/${conversationId}/remove/`, { user_id: userId });
export const renameGroup = (conversationId, name) =>
  apiPost(`/api/conversations/group/${conversationId}/rename/`, { name });
