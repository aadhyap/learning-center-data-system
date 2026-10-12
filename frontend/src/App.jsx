import { useEffect, useState } from "react";
import { useStudents } from "./queries/useStudents";
import { useTodayStudents } from "./queries/useTodayStudents";
import {
  getAuthToken,
  setAuthToken
} from "./api/authFetch";
import "./App.css";

import { useDebounce } from "./utils/useDebounce";
import StudentList from "./components/StudentList";
import StudentProfile from "./components/StudentProfile";
import TodayStudents from "./TodayStudents";
import AddStudent from "./components/AddStudent";
import Login from "./components/Auth/Login";
import StudentFilters from "./components/StudentFilters";

function App() {
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

  // The input changes immediately; only the API search is debounced.
  const debouncedSearch = useDebounce(filters.search, 350);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState("students");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [googleToken, setGoogleToken] = useState(() => getAuthToken());

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

  const {
    todayStudents,
    loadTodayStudents,
    checkIn,
    checkOut,
    saveSession
  } = useTodayStudents();

  // Program/belt/etc. changes take effect immediately; search waits 350 ms.
  useEffect(() => {
    if (!googleToken || filters.search !== debouncedSearch) return;

    loadStudents(studentPage, pageSize, {
      ...filters,
      search: debouncedSearch
    });
  }, [
    googleToken,
    studentPage,
    pageSize,
    debouncedSearch,
    filters.search,
    filters.program,
    filters.beltColor,
    filters.track,
    filters.rank,
    filters.roboticsLevel,
    filters.attendance,
    filters.sortBy,
    loadStudents
  ]);

  useEffect(() => {
    if (!googleToken) return;
    loadTodayStudents();
  }, [googleToken]);

  function refreshStudents() {
    return loadStudents(studentPage, pageSize, {
      ...filters,
      search: debouncedSearch
    });
  }

  function updateFilters(updater) {
    setStudentPage(1);
    setFilters((previous) => ({
      ...previous,
      ...(typeof updater === "function" ? updater(previous) : updater)
    }));
  }

  function onSelectStudent(student) {
    setSelectedStudent(student);
  }

  function onAddStudent() {
    setShowAddStudent(true);
  }

  function onViewToday() {
    setSelectedStudent(null);
    setPage("today");
  }

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

  async function handleCreateStudent(studentData, selectedTags = []) {
    const success = await createStudent(studentData, selectedTags);

    if (success) {
      setShowAddStudent(false);
      setStudentPage(1);
      await loadStudents(1, pageSize, {
        ...filters,
        search: debouncedSearch
      });
    }

    return success;
  }

  async function handleCheckIn(studentId) {
    const result = await checkIn(studentId);
    await loadTodayStudents();
    await refreshStudents();
    return result;
  }

  async function handleCheckOut(sessionId) {
    const result = await checkOut(sessionId);
    await loadTodayStudents();
    await refreshStudents();
    return result;
  }

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
      {page === "students" && (
        <aside className="sidebar">
          <h2>Student Progress</h2>

          <input
            className="search"
            type="text"
            placeholder="Search students..."
            value={filters.search}
            onChange={(event) =>
              updateFilters({ search: event.target.value })
            }
          />

          <StudentFilters
            filters={filters}
            setFilters={updateFilters}
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
