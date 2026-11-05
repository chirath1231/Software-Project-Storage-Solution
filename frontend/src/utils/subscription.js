import api from "../api/axios";

export const FREE_PLAN_GB = 5;

/**
 * Returns the storage limit (GB) of the user's current plan.
 * If the user owns several plans, the one with the most storage wins
 * (same rule the Subscription page uses). Falls back to the free 5 GB.
 */
export async function fetchPlanStorageGB(identifier) {
  if (!identifier) return FREE_PLAN_GB;
  try {
    const res = await api.get(
      `/api/subscriptions/user-subscriptions/${encodeURIComponent(identifier)}/`
    );
    const best = (res.data || []).reduce(
      (max, p) => Math.max(max, Number(p.storage) || 0),
      0
    );
    return best || FREE_PLAN_GB;
  } catch (err) {
    console.error("Error fetching subscription:", err);
    return FREE_PLAN_GB;
  }
}
