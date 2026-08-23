import { apiPost } from "./apiClient";

// Stateless single-turn call — mirrors the web AI assistant widget.
export const sendAssistantMessage = (message) =>
  apiPost("/api/assistant/chat/", { message });
