import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(
      "http://127.0.0.1:8000/students"
    )
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
  const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
  const username = student.username.toLowerCase();
  const searchText = search.toLowerCase();

  return (
    fullName.includes(searchText) ||
    username.includes(searchText)
  );
});

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Code Ninjas</h2>

        <input
          className="search"
          type="text"
          placeholder="Search ninjas..."
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
      </aside>

      <main className="content">
        <div className="page-header">
          <div>
            <h1>Ninjas</h1>
            <p>View and manage student progress</p>
          </div>

          <button>+ Add Ninja</button>
        </div>

        <div className="ninja-list">
          {filteredStudents.map((student) => (
            <div className="ninja-card" key={student.student_id}>

              <div className="ninja-avatar">
                {student.first_name[0]}
                {student.last_name[0]}
              </div>

              <div className="ninja-info">
                <h2>
                  {student.first_name} {student.last_name}
                </h2>
                <p>@{student.username}</p>
              </div>

              <div className="ninja-detail">
                <span className="detail-label">Program</span>
                <span>{student.program}</span>
              </div>

              <div className="ninja-detail">
                <span className="detail-label">Belt</span>
                <span>{student.belt}</span>
              </div>

              <button className="view-button">
                View →
              </button>

            </div>
          ))}
        </div> 
      </main>
    </div>
  );
}

export default App;