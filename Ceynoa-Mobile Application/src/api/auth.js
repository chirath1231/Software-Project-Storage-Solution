// BASE_URL is defined in apiClient.js — change it there for all API calls.
import { BASE_URL } from "./apiClient";

function extractError(data) {
  if (!data || typeof data === "string") return data || "Something went wrong";
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === "string") return first;
  return "Something went wrong";
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(extractError(data));
  return data;
}

export const apiLogin = (email, password) =>
  post("/api/accounts/login/", { email, password });

export const apiRegister = (username, email, password, password2) =>
  post("/api/accounts/register/", { username, email, password, password2 });
