import { authFetch } from "./authFetch";

export async function getStudents() {
  const response = await authFetch(`/students`);

  if (!response.ok) {
    throw new Error("Failed to load students");
  }

  return response.json();
}

export async function getTodayStudents() {
  const response = await authFetch(`/students/today`);

  if (!response.ok) {
    throw new Error(`Failed to load today's students: ${response.status}`);
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


export async function addStudent(studentData) {
  const response = await authFetch(`/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(studentData)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || "Failed to create student");
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

export async function getStudentHistory(studentId) {
  const response = await authFetch(
    `/students/${studentId}/history`
  );

  if (!response.ok) {
    throw new Error("Failed to load student history");
  }

  return response.json();
}

export async function updateStudent(studentId, studentData) {
  const response = await authFetch(`/students/${studentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(studentData)
  });

  if (!response.ok) {
    throw new Error("Failed to update student");
  }

  return response.json();
}

export async function updateSession(sessionId, sessionData) {
  const response = await authFetch(
    `/sessions/${sessionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(sessionData)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update session");
  }

  return response.json();
}

export async function getStudentTags(studentId) {
  const response = await authFetch(
    `/students/${studentId}/tags`
  );

  if (!response.ok) {
    throw new Error("Failed to load student tags");
  }

  return response.json();
}


export async function addStudentTag(studentId, tagName) {
  const response = await authFetch(`/students/${studentId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tag_name: tagName
    })
  });

  if (!response.ok) {
    throw new Error("Failed to add student tag");
  }

  return response.json();
}


export async function expireSessionTag(tagId) {
  const response = await authFetch(
    `/tags/${tagId}/expire`,
    { method: "PATCH" }
  );

  if (!response.ok) {
    throw new Error("Failed to remove tag");
  }

  return response.json();
}