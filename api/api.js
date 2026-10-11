
import { authFetch } from "./authFetch";

export async function getStudents() {
  const response = await authFetch("/students");

  if (!response.ok) {
    throw new Error("Failed to load students");
  }

  return response.json();
}

export async function getTodayStudents() {
  const response = await authFetch("/students/today");

  if (!response.ok) {
    throw new Error("Failed to load today's students");
  }

  return response.json();
}

export async function checkInStudent(studentId) {
  const response = await authFetch(
    `/students/${studentId}/check-in`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error("Check-in failed");
  }

  return response.json();
}

export async function deleteSession(sessionId) {
  const response = await authFetch(
    `/sessions/${sessionId}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Deleting session failed");
  }

  return response.json();
}
