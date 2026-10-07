import SessionHistory from "./SessionHistory";
import { useEffect, useState } from "react";

function StudentProfile({ student, onBack }) {
  const [sessions, setSessions] = useState([]);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    program: student.program || "",
    belt: student.belt || "",
    summary: student.summary || ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

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
        ← Back to Students
      </button>

      <div className="profile-card">

        <div className="profile-header">
          <div>

            {isEditing ? (
              <div className="name-inputs">
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />

                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <h1>
                {student.first_name} {student.last_name}
              </h1>
            )}

            <p>@{student.username}</p>

          </div>

          <button
            className="back-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>

        </div>


        <div className="profile-details">

          <div>
            <span className="detail-label">Program</span>

            {isEditing ? (
              <input
                name="program"
                value={formData.program}
                onChange={handleChange}
              />
            ) : (
              <p>{student.program}</p>
            )}
          </div>


          <div>
            <span className="detail-label">Belt</span>

            {isEditing ? (
              <input
                name="belt"
                value={formData.belt}
                onChange={handleChange}
              />
            ) : (
              <p>{student.belt}</p>
            )}
          </div>

        </div>


        <div className="profile-summary">
          <span className="detail-label">Summary</span>

          {isEditing ? (
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
            />
          ) : (
            <p>{student.summary || "No summary yet."}</p>
          )}

        </div>


        {isEditing && (
          <button className="back-button">
            Save Changes
          </button>
        )}

      </div>


      <h2 className="history-title">
        Session History
      </h2>

      <SessionHistory sessions={sessions} />

    </div>
  );
}

export default StudentProfile;