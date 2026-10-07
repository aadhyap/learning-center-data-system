import { useEffect, useState } from "react";
import { getStudents } from "../api/api";

export function useStudents() {
  const [students, setStudents] = useState([]);

  async function loadStudents() {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  return {
    students,
    loadStudents
  };
}