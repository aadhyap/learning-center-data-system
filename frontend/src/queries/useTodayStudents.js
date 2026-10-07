import { useEffect, useState } from "react";

import {
  getTodayStudents,
  checkInStudent,
  deleteSession,
  updateSession
} from "../api/api";


export function useTodayStudents() {
  const [todayStudents, setTodayStudents] = useState([]);

  async function saveSession(sessionId, sessionData) {
  try {
    await updateSession(sessionId, sessionData);

    setTodayStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.session_id === sessionId
          ? { ...student, ...sessionData }
          : student
      )
    );

    return true;

  } catch (error) {
    console.error("Error updating session:", error);
    return false;
  }
}

  async function loadTodayStudents() {
    try {
      const data = await getTodayStudents();
      setTodayStudents(data);
    } catch (error) {
      console.error("Error loading today's students:", error);
    }
  }


  async function checkIn(studentId) {
    // Change UI immediately
    const temporarySession = {
      student_id: studentId,
      session_id: `temp-${studentId}`
    };

    setTodayStudents((current) => [
      ...current,
      temporarySession
    ]);

    try {
      // Create the real session
      await checkInStudent(studentId);

      // Replace our temporary data with database data
      await loadTodayStudents();

    } catch (error) {
      console.error("Error checking in student:", error);

      // API failed, undo the UI change
      setTodayStudents((current) =>
        current.filter(
          (student) => student.student_id !== studentId
        )
      );
    }
  }


  async function checkOut(sessionId) {
    // Remember the session in case DELETE fails
    console.log("CHECK OUT CALLED:", sessionId);
    const sessionToDelete = todayStudents.find(
      (student) => student.session_id === sessionId
    );

    // Change UI immediately
    setTodayStudents((current) =>
      current.filter(
        (student) => student.session_id !== sessionId
      )
    );

    try {
      // Delete from database
      await deleteSession(sessionId);

    } catch (error) {
      console.error("Error checking out student:", error);

      // DELETE failed, put it back
      if (sessionToDelete) {
        setTodayStudents((current) => [
          ...current,
          sessionToDelete
        ]);
      }
    }
  }


  useEffect(() => {
    loadTodayStudents();
  }, []);


  return {
  todayStudents,
  loadTodayStudents,
  checkIn,
  checkOut,
  saveSession
};
}