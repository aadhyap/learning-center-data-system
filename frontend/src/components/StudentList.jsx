import { useStudentTags } from "../queries/useStudentTags";
import StudentTags from "./StudentTags";
import { CalendarDays, ArrowLeft} from "lucide-react";

function timeAgo(date) {
  if (!date) return "Never";

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

// Each student card fetches its own active tags.
function StudentCard({
  student,
  todaySession,
  onCheckIn,
  onCheckOut,
  onSelectStudent
}) {
  const { tags } = useStudentTags(student.student_id);

  const isCheckedIn = Boolean(todaySession);

  return (
    <div className="student-card">

      <div className="student-avatar">
        {student.first_name[0]}
        {student.last_name[0]}
      </div>

      <div className="student-info">
        <h2>
          {student.first_name} {student.last_name}
        </h2>

        {/* ACTIVE TAGS */}
        <StudentTags tags={tags} />
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
          className={`checkin-toggle ${
            isCheckedIn ? "active" : ""
          }`}
          onClick={() => {
            if (isCheckedIn) {
              onCheckOut(todaySession.session_id);
            } else {
              onCheckIn(student.student_id);
            }
          }}
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
}

function StudentList({
  students,
  todayStudents,
  onCheckIn,
  onCheckOut,
  onSelectStudent,
  onAddStudent,
  onViewToday
}) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>View and manage student progress</p>
        </div>

              <div className="student-header-actions">
        <button
          className="today-students-button"
          onClick={onViewToday}
          type="button"
        >
          <CalendarDays size={16} />
          Today's Students
         
        </button>

        <button
          className="add-student-button"
          onClick={onAddStudent}
          type="button"
        >
          + Add Student
        </button>
      </div>
      </div>

      <div className="student-list">
        {students.map(student => {
          const todaySession = todayStudents.find(
            todayStudent =>
              todayStudent.student_id === student.student_id
          );

          return (
            <StudentCard
              key={student.student_id}
              student={student}
              todaySession={todaySession}
              onCheckIn={onCheckIn}
              onCheckOut={onCheckOut}
              onSelectStudent={onSelectStudent}
            />
          );
        })}
      </div>
    </>
  );
}

export default StudentList;
