function StudentList({ students, onSelectStudent }) {
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
        {students.map((student) => (
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

            <button
              className="view-button"
              onClick={() => onSelectStudent(student)}
            >
              View →
            </button>

          </div>
        ))}
      </div>
    </>
  );
}

export default StudentList;