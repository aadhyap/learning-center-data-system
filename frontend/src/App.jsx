import { useEffect, useState } from "react";
import "./App.css";

import StudentList from "./components/StudentList";
import StudentProfile from "./components/StudentProfile";
import TodayStudents from "./TodayStudents";

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [page, setPage] = useState("students");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/students")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setStudents(data);
      })
      .catch((error) => {
        console.error("Error loading students:", error);
      });
  }, []);

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
            setSelectedStudent(null);
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
          onBack={() => {
            setSelectedStudent(null);
            setPage("students");
          }}
        />

      ) : selectedStudent ? (

        <StudentProfile
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
        />

      ) : (

        <StudentList
          students={filteredStudents}
          onSelectStudent={setSelectedStudent}
        />

      )}

    </main>

  </div>
);
}

export default App;