import { useEffect, useState } from "react";
import { getStudentHistory } from "../api/api";

export function useStudentHistory(studentId) {
  const [sessions, setSessions] = useState([]);

  async function loadStudentHistory() {
    try {
      const data = await getStudentHistory(studentId);
      setSessions(data);
    } catch (error) {
      console.error("Error loading student history:", error);
    }
  }

  useEffect(() => {
    loadStudentHistory();
  }, [studentId]);

  return {
    sessions,
    loadStudentHistory
  };
}