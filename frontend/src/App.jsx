import { useState } from "react";
import { useStudents } from "./queries/useStudents";
import { useTodayStudents } from "./queries/useTodayStudents";
import "./App.css";

import StudentList from "./components/StudentList";
import StudentProfile from "./components/StudentProfile";
import TodayStudents from "./TodayStudents";

function App() {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [page, setPage] = useState("students");

  const {
    students,
    saveStudent
  } = useStudents();

  const selectedStudent = students.find(
  (student) => student.student_id === selectedStudentId
);

  const {
  todayStudents,
  checkIn,
  checkOut,
  saveSession
} = useTodayStudents();


  const filteredStudents = students.filter((student) => {
    const fullName =
      `${student.first_name} ${student.last_name}`.toLowerCase();

    const username = student.username.toLowerCase();
    const searchText = search.toLowerCase();

    return (
      fullName.includes(searchText) ||
      username.includes(searchText)
    );
  });

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
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <h3>Filters</h3>

        <p>Program</p>

        <label>
          <input type="checkbox" /> Create
        </label>

        <label>
          <input type="checkbox" /> Junior
        </label>

        <label>
          <input type="checkbox" /> Godot
        </label>

        <button
          className="today-nav"
          onClick={() => {
            setSelectedStudentId(null);
            setPage("today");
          }}
        >
          <span>Today's Students</span>
          <span className="today-arrow">→</span>
        </button>

      </aside>
    )}


    <main className="content">

      {page === "today" ? (

        <TodayStudents
          todayStudents={todayStudents}
          onSaveSession={saveSession}
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
        />
      )}

    </main>

  </div>
);
}

export default App;