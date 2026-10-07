import SessionHistory from "./SessionHistory";
import { useEffect, useState } from "react";

function StudentProfile({ student, onBack }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/students/${student.student_id}/history`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Session history:", data);
        setSessions(data);
      })
      .catch((error) => {
        console.error("Error loading session history:", error);
      });
  }, [student.student_id]);

  return (
    <div className="student-profile">

      <button className="back-button" onClick={onBack}>
        ← Back to Ninjas
      </button>

      <div className="profile-card">

        <div className="profile-header">

          <div>
            <h1>
              {student.first_name} {student.last_name}
            </h1>
            <p>@{student.username}</p>
          </div>
        </div>

        <div className="profile-details">
          <div>
            <span className="detail-label">Program</span>
            <p>{student.program}</p>
          </div>

          <div>
            <span className="detail-label">Belt</span>
            <p>{student.belt}</p>
          </div>
        </div>

        <div className="profile-summary">
          <span className="detail-label">Summary</span>
          <p>{student.summary || "No summary yet."}</p>
        </div>

      </div>

      <h2 className="history-title">Session History</h2>

      <SessionHistory sessions={sessions} />

    </div>
  );
}

export default StudentProfile;