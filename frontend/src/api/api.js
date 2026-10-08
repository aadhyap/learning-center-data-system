const API_URL = "http://127.0.0.1:8000";

export async function getStudents() {
  const response = await fetch(`${API_URL}/students`);

  if (!response.ok) {
    throw new Error("Failed to load students");
  }

  return response.json();
}

export async function getTodayStudents() {
  const response = await fetch(`${API_URL}/students/today`);

  if (!response.ok) {
    throw new Error("Failed to load today's students");
  }

  return response.json();
}

export async function checkInStudent(studentId) {
  const response = await fetch(
    `${API_URL}/students/${studentId}/check-in`,
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
  const response = await fetch(
    `${API_URL}/sessions/${sessionId}`,
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
  const response = await fetch(
    `${API_URL}/students/${studentId}/history`
  );

  if (!response.ok) {
    throw new Error("Failed to load student history");
  }

  return response.json();
}

export async function updateStudent(studentId, studentData) {
  const response = await fetch(
    `${API_URL}/students/${studentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(studentData)
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update student");
  }

  return response.json();
}

export async function updateSession(sessionId, sessionData) {
  const response = await fetch(
    `${API_URL}/sessions/${sessionId}`,
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
  const response = await fetch(
    `${API_URL}/students/${studentId}/tags`
  );

  if (!response.ok) {
    throw new Error("Failed to load student tags");
  }

  return response.json();
}

export async function addSessionTag(sessionId, tagName) {
  const response = await fetch(
    `${API_URL}/sessions/${sessionId}/tags`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag_name: tagName }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to add tag");
  }

  return response.json();
}

export async function expireSessionTag(tagId) {
  const response = await fetch(
    `${API_URL}/tags/${tagId}/expire`,
    { method: "PATCH" }
  );

  if (!response.ok) {
    throw new Error("Failed to remove tag");
  }

  return response.json();
}