import { useEffect, useState } from "react";

import {
  getStudents,
  updateStudent,
  addStudent,
  addStudentTag
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

  async function createStudent(studentData, selectedTags = []) {
    try {
      // Create student in PostgreSQL through the API
      const newStudent = await addStudent(studentData);

      // Add optional tags to the newly created student
      for (const tagName of selectedTags) {
        await addStudentTag(newStudent.student_id, tagName);
      }

      // Refresh the student list
      await loadStudents();

      return true;

    } catch (error) {
      console.error("Error creating student:", error);
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
  saveStudent,
  createStudent
};
  
}




