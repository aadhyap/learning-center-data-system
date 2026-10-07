import { useEffect, useState } from "react";

import {
  getStudents,
  updateStudent
} from "../api/api";

export function useStudents() {
  const [students, setStudents] = useState([]);

  async function saveStudent(studentId, studentData) {
  try {
    await updateStudent(studentId, studentData);

    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.student_id === studentId
          ? { ...student, ...studentData }
          : student
      )
    );

    return true;

  } catch (error) {
    console.error("Error updating student:", error);
    return false;
  }
}

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
    loadStudents,
    saveStudent
  };
}


