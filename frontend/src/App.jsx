
import { useEffect, useState } from "react";
import { useStudents } from "./queries/useStudents";
import { useTodayStudents } from "./queries/useTodayStudents";
import {
  getAuthToken,
  setAuthToken
} from "./api/authFetch";
import "./App.css";

import StudentList from "./components/StudentList";
import StudentProfile from "./components/StudentProfile";
import TodayStudents from "./TodayStudents";
import AddStudent from "./components/AddStudent";
import Login from "./components/Auth/Login";
import StudentFilters from "./components/StudentFilters";


function App() {
  // Filters
  const [filters, setFilters] = useState({
    search: "",
    program: "all",
    beltColor: "all",
    track: "all",
    rank: "all",
    roboticsLevel: "all",
    attendance: "all",
    sortBy: "name"
  });
 const [searchInput, setSearchInput] = useState("");
  // Navigation
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState("students");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [googleToken, setGoogleToken] = useState(
    () => getAuthToken()
  );

  // Student data and pagination
  const {
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
  } = useStudents();

  // Today's students
  const {
    todayStudents,
    loadTodayStudents,
    checkIn,
    checkOut,
    saveSession
  } = useTodayStudents();

  useEffect(() => {
  const timer = setTimeout(() => {
    if (searchInput !== filters.search) {
      updateFilters((previous) => ({
        ...previous,
        search: searchInput
      }));
    }
  }, 350);

  return () => clearTimeout(timer);
}, [searchInput, filters.search]);

  // Load students when login, page, size, or filters change
  useEffect(() => {
    if (!googleToken) return;

    loadStudents(studentPage, pageSize, filters);
  }, [
    googleToken,
    studentPage,
    pageSize,
    filters,
    loadStudents
  ]);

  // Load today's students after login
  useEffect(() => {
    if (!googleToken) return;


    loadTodayStudents();
  }, [googleToken]);

  // Refresh the currently displayed student page
  function refreshStudents() {
    return loadStudents(studentPage, pageSize, filters);
  }

  // Reset pagination when filters change
function updateFilters(updater) {
  setStudentPage(1);

  setFilters((previous) => ({
    ...previous,
    ...(typeof updater === "function"
      ? updater(previous)
      : updater)
  }));
}

  // Open student profile
  function onSelectStudent(student) {
    setSelectedStudent(student);
  }

  // Open add student modal
  function onAddStudent() {
    setShowAddStudent(true);
  }

  // Open today's students page
  function onViewToday() {
    setSelectedStudent(null);
    setPage("today");
  }

  // Save a student and refresh their profile
  async function handleSaveStudent(studentId, studentData) {
    const success = await saveStudent(studentId, studentData);

    if (success) {
      setSelectedStudent((current) =>
        current?.student_id === studentId
          ? { ...current, ...studentData }
          : current
      );

      await refreshStudents();
    }

    return success;
  }

  // Create a student and refresh the list
  async function handleCreateStudent(studentData, selectedTags = []) {
    const success = await createStudent(studentData, selectedTags);

    if (success) {
      setShowAddStudent(false);
      setStudentPage(1);
      await loadStudents(1, pageSize, filters);
    }

    return success;
  }

  // Check in student and refresh attendance
  async function handleCheckIn(studentId) {
    const result = await checkIn(studentId);

    await loadTodayStudents();
    await refreshStudents();

    return result;
  }

  // Check out student and refresh attendance
  async function handleCheckOut(sessionId) {
    const result = await checkOut(sessionId);

    await loadTodayStudents();
    await refreshStudents();

    return result;
  }

  // Login
  if (!googleToken) {
    return (
      <Login
        onLogin={(token) => {
          setAuthToken(token);
          setGoogleToken(token);
        }}
      />
    );
  }

  return (
    <div className="app">

      {/* Sidebar */}
      {page === "students" && (
        <aside className="sidebar">
          <h2>Student Progress</h2>

          <input
            className="search"
            type="text"
            placeholder="Search students..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <StudentFilters
            filters={filters}
            setFilters={(updater) => {
              setSearchInput("");
              updateFilters(updater);
            }}
          />
        </aside>
      )}

      <main className="content">

        {page === "today" ? (

          <TodayStudents
            todayStudents={todayStudents}
            onSaveSession={saveSession}
            loadTodayStudents={loadTodayStudents}
            loadStudents={refreshStudents}
            onBack={() => {
              setSelectedStudent(null);
              setPage("students");
            }}
          />

        ) : selectedStudent ? (

          <StudentProfile
            student={selectedStudent}
            onSave={handleSaveStudent}
            onBack={() => setSelectedStudent(null)}
          />

        ) : (
          <>
            {error && (
              <p role="alert" style={{ color: "red" }}>
                {error}
              </p>
            )}

            <StudentList
              students={students}
              todayStudents={todayStudents}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onSelectStudent={onSelectStudent}
              onAddStudent={onAddStudent}
              onViewToday={onViewToday}
              page={studentPage}
              pageSize={pageSize}
              totalStudents={totalStudents}
              onPageChange={setStudentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setStudentPage(1);
              }}
              isLoading={isLoading}
            />
          </>
        )}

      </main>

      {/* Add Student Modal */}
      {page === "students" &&
        !selectedStudent &&
        showAddStudent && (
          <div
            className="modal-overlay"
            onClick={() => setShowAddStudent(false)}
          >
            <div
              className="modal-card"
              onClick={(event) => event.stopPropagation()}
            >
              <AddStudent
                onBack={() => setShowAddStudent(false)}
                onCreate={handleCreateStudent}
              />
            </div>
          </div>
        )}

    </div>
  );
}

export default App;
