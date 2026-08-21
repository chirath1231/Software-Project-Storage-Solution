import AsyncStorage from "@react-native-async-storage/async-storage";

// For Physical Mobile Devices (Expo Go) & Emulators on same Wi-Fi:
// Uses your PC's Wi-Fi IP address (192.168.8.158:8000)
export const BASE_URL = "http://192.168.8.158:8000";

async function getToken() {
  try {
    const saved = await AsyncStorage.getItem("@ceynoa_user");
    if (!saved) return null;
    return JSON.parse(saved).accessToken || null;
  } catch {
    return null;
  }
}

async function authHeaders(extra = {}) {
  const token = await getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiGet(path) {
  const headers = await authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) {
    const err = Object.assign(new Error(res.statusText), { status: res.status });
    throw err;
  }
  return res.json();
}

export async function apiPost(path, body) {
  const headers = await authHeaders({ "Content-Type": "application/json" });
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error(data?.detail || data?.error || "Request failed"),
      { status: res.status, data }
    );
  }
  return data;
}

export async function apiDelete(path) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE", headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data?.detail || "Delete failed"), { status: res.status });
  }
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

export async function apiUpload(path, formData) {
  // Do NOT set Content-Type — fetch sets it with the correct multipart boundary
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error(data?.detail || data?.error || "Upload failed"),
      { status: res.status, data }
    );
  }
  return data;
}
