
import { useEffect, useState } from "react";
import { getStudentTags } from "../api/api";

export function useStudentTags(studentId) {
  const [tags, setTags] = useState([]);

  async function loadTags() {
    try {
      const data = await getStudentTags(studentId);
      setTags(data);
    } catch (error) {
      console.error("Error loading student tags:", error);
    }
  }

  useEffect(() => {
    loadTags();
  }, [studentId]);

  return { tags, loadTags };
}
