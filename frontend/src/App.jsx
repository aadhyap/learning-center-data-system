import { useEffect, useState } from "react";
import { useStudents } from "./queries/useStudents";
import { useTodayStudents } from "./queries/useTodayStudents";
import { setAuthToken } from "./api/authFetch";
import { filterStudents } from "./utils/filterStudents";
import "./App.css";

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
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [page, setPage] = useState("students");
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  

    const {
    students,
    loadStudents,
    saveStudent,
    createStudent
  } = useStudents();

  const selectedStudent = students.find(
  (student) => student.student_id === selectedStudentId
);

  const {
  todayStudents,
  loadTodayStudents,
  checkIn,
  checkOut,
  saveSession
} = useTodayStudents();


  const filteredStudents = filterStudents(students, filters);

  useEffect(() => {
  if (googleToken) {
    loadStudents();
    loadTodayStudents();
  }
}, [googleToken]);

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

    {/* SIDEBAR ONLY EXISTS ON STUDENTS PAGE */}
    {page === "students" && (
      <aside className="sidebar">

        <h2>Student Progress</h2>

        <input
        className="search"
        type="text"
        placeholder="Search students..."
        value={filters.search}
        onChange={(event) =>
          setFilters((previous) => ({
            ...previous,
            search: event.target.value
          }))
        }
        />

        <StudentFilters
          filters={filters}
          setFilters={setFilters}
        />

      </aside>
    )}


    <main className="content">

      {page === "today" ? (

        <TodayStudents
          todayStudents={todayStudents}
          onSaveSession={saveSession}
          loadTodayStudents={loadTodayStudents}
          loadStudents={loadStudents}
          onBack={() => {
            setSelectedStudentId(null);
            setPage("students");
          }}
        />

      ) : selectedStudent ? (

        <StudentProfile
          student={selectedStudent}
          onSave={saveStudent}
          onBack={() => setSelectedStudentId(null)}
        />

      ) : (

        <StudentList
          students={filteredStudents}
          todayStudents={todayStudents}
          onCheckIn={checkIn}
          onCheckOut={checkOut}
          onSelectStudent={(student) =>
            setSelectedStudentId(student.student_id)
          }
          onAddStudent={() => setShowAddStudent(true)}
          onViewToday={() => {
            setSelectedStudentId(null);
            setPage("today");
          }}
        />
      )}

    </main>

    {page === "students" && !selectedStudent && showAddStudent && (
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
        onCreate={createStudent}
      />
    </div>
  </div>
)}

  </div>
);
}

export default App;