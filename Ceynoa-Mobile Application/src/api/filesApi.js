import { apiGet, apiPost, apiDelete, apiUpload } from "./apiClient";

export const getFiles = () => apiGet("/api/files/");

export const trashFile = (id) => apiDelete(`/api/files/${id}/trash/`);

// Pass user.username (not email) — matches what the web app stores in subscriptions
export async function getSubscription(usernameOrEmail) {
  const data = await apiGet(
    `/api/subscriptions/user-subscriptions/${encodeURIComponent(usernameOrEmail)}/`
  );
  const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted[0]?.storage || 5;
}

// Share
export const getShare = (fileId) => apiGet(`/api/files/${fileId}/share/`);
export const createOrUpdateShare = (fileId, linkPermission) =>
  apiPost(`/api/files/${fileId}/share/`, { link_permission: linkPermission });
export const deleteShare = (fileId) => apiDelete(`/api/files/${fileId}/share/`);

// Collaborators
export const addCollaborator = (fileId, email, permission) =>
  apiPost(`/api/files/${fileId}/share/collaborators/`, { email, permission });
export const removeCollaborator = (fileId, collabId) =>
  apiDelete(`/api/files/${fileId}/share/collaborators/${collabId}/`);

export async function uploadFile(uri, name, mimeType) {
  const formData = new FormData();
  formData.append("file", { uri, name, type: mimeType || "application/octet-stream" });
  return apiUpload("/api/files/upload/", formData);
}
