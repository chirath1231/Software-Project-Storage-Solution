import { apiGet, apiPost } from "./apiClient";

export const getTickets = () => apiGet("/api/tickets/");

export const createTicket = ({ name, email, category, priority, title, description }) =>
  apiPost("/api/tickets/", { name, email, category, priority, title, description });
