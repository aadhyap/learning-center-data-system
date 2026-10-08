import SessionHistory from "./SessionHistory";
import { useState } from "react";
import { useStudentHistory } from "../queries/useStudentHistory";

function StudentProfile({
  student,
  onBack,
  onSave
}) {
  const { sessions } = useStudentHistory(student.student_id);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    program: student.program || "",
    belt: student.belt || "",
    summary: student.summary || "",
    debrief_method: student.debrief_method || ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleSave() {
  console.log("SAVE BUTTON CLICKED");

  const updatedStudent = {
    username: student.username,
    first_name: formData.first_name,
    last_name: formData.last_name,
    email: student.email,
    program: formData.program,
    belt: formData.belt,
    debrief_method: student.debrief_method,
    summary: formData.summary
  };

  console.log("Sending student:", updatedStudent);

  const success = await onSave(
    student.student_id,
    updatedStudent
  );

  console.log("Save result:", success);

  if (success) {
    setIsEditing(false);
  }
}



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

        <div className="profile-field">
   
   <label className="detail-label">Debrief Method</label>

      {isEditing ? (
        <select
          name="debrief_method"
          value={formData.debrief_method}
          onChange={handleChange}
        >
          <option value="">Not Set</option>
          <option value="in_person">In Person</option>
          <option value="email">Email</option>
        </select>
      ) : (
        <p>
          {student.debrief_method === "in_person"
            ? "In Person"
            : student.debrief_method === "email"
            ? "Email"
            : "Not Set"}
        </p>
      )}
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
        <button
        className="back-button"
        onClick={handleSave}
        >
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