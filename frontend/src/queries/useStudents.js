
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
      const start = performance.now();

      const data = await getStudents(page, size, filters);

      console.log(
        "Students API took:",
        Math.round(performance.now() - start),
        "ms",
        filters
      );


      let studentList;
      let total;

      if (Array.isArray(data)) {
        studentList = data;
        total = data.length;
      } else if (data && Array.isArray(data.students)) {
        studentList = data.students;
        total = Number(data.total ?? data.students.length);
      } else {
        throw new Error("Unexpected students API response format");
      }

      setStudents(studentList);
      setTotalStudents(total);
    } catch (err) {
      console.error("Error loading students:", err);
      setStudents([]);
      setTotalStudents(0);
      setError(err.message || "Failed to load students.");
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
