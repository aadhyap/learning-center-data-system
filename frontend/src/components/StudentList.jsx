import { useState } from "react";

function timeAgo(date) {
  if (!date) {
    return "Never";
  }

  const lastSession = new Date(date);
  const today = new Date();

  const difference = today - lastSession;
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;

  const months = Math.floor(days / 30);

  if (months === 1) return "1 month ago";

  return `${months} months ago`;
}

function StudentList({ students, onSelectStudent }) {
  const [checkedInStudents, setCheckedInStudents] = useState([]);

  function toggleCheckIn(studentId) {
    if (checkedInStudents.includes(studentId)) {
      setCheckedInStudents(
        checkedInStudents.filter((id) => id !== studentId)
      );
    } else {
      setCheckedInStudents([
        ...checkedInStudents,
        studentId
      ]);
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>View and manage student progress</p>
        </div>

        <button>+ Add Student</button>
      </div>

      <div className="student-list">
        {students.map((student) => {
          console.log(student.first_name, student.last_session);

          const isCheckedIn =
            checkedInStudents.includes(student.student_id);

          return (
            <div className="student-card" key={student.student_id}>

              <div className="student-avatar">
                {student.first_name[0]}
                {student.last_name[0]}
              </div>

              <div className="student-info">
                <h2>
                  {student.first_name} {student.last_name}
                </h2>
                <p>@{student.username}</p>
              </div>

              <div className="student-detail">
                <span className="detail-label">Program</span>
                <span>{student.program}</span>
              </div>

              <div className="student-detail">
                <span className="detail-label">Belt</span>
                <span>{student.belt}</span>
              </div>

              <div className="student-detail">
                <span className="detail-label">Last Here</span>
                <span>{timeAgo(student.last_session)}</span>
              </div>

              <div className="checkin-control">
                <span className="detail-label">Check In</span>

                <button
                  className={`checkin-toggle ${isCheckedIn ? "active" : ""}`}
                  onClick={() => toggleCheckIn(student.student_id)}
                >
                  <span className="toggle-circle"></span>
                </button>
            </div>

              

            
              <button
                className="view-button"
                onClick={() => onSelectStudent(student)}
              >
                View →
              </button>

            </div>

            
          );
        })}
      </div>
    </>
  );
}

export default StudentList;