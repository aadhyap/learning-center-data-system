import { authFetch } from "./authFetch";

export async function finalizeDay() {
  const response = await authFetch("/sessions/finalize-day", {
    method: "POST"
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to finalize day");
  }

  return response.json();
}