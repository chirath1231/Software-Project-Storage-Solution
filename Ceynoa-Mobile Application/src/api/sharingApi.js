import { apiGet } from "./apiClient";

export const getSharedFile = (token) => apiGet(`/api/shared/${token}/`);
export const getSharedFolder = (token) => apiGet(`/api/shared/folder/${token}/`);

// Accepts either a full share URL (web format: ".../shared/<token>/" or
// ".../shared/folder/<token>/") or a bare token, and returns { kind, token }.
export function parseSharedLink(input) {
  const raw = (input || "").trim();
  if (!raw) return null;

  const folderMatch = raw.match(/\/shared\/folder\/([0-9a-fA-F-]{36})/);
  if (folderMatch) return { kind: "folder", token: folderMatch[1] };

  const fileMatch = raw.match(/\/shared\/([0-9a-fA-F-]{36})/);
  if (fileMatch) return { kind: "file", token: fileMatch[1] };

  const bareMatch = raw.match(/^[0-9a-fA-F-]{36}$/);
  if (bareMatch) return { kind: "file", token: raw };

  return null;
}
