
import { useCallback, useState } from "react";

import {
  getStudents,
  updateStudent,
  addStudent,
  addStudentTag
} from "../api/api";

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [studentPage, setStudentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const loadStudents = useCallback(async (
    page = 1,
    size = 25,
    filters = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getStudents(page, size, filters);

      setStudents(data.students);
      setTotalStudents(data.total);
    } catch (err) {
      console.error("Error loading students:", err);
      setError("Failed to load students.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    } catch (err) {
      console.error("Error updating student:", err);
      return false;
    }
  }

  async function createStudent(studentData, selectedTags = []) {
    try {
      const newStudent = await addStudent(studentData);

      for (const tagName of selectedTags) {
        await addStudentTag(newStudent.student_id, tagName);
      }

      setStudentPage(1);
      return true;
    } catch (err) {
      console.error("Error creating student:", err);
      return false;
    }
  }

  return {
    students,
    totalStudents,
    isLoading,
    error,
    studentPage,
    setStudentPage,
    pageSize,
    setPageSize,
    loadStudents,
    saveStudent,
    createStudent
  };
}
