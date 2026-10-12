
import { useStudentTags } from "../queries/useStudentTags";
import StudentTags from "./StudentTags";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

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


// --------------------------------------------------
// Student Card
// --------------------------------------------------

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


// --------------------------------------------------
// Student List with server-side pagination
// --------------------------------------------------

function StudentList({
  students = [],
  todayStudents = [],
  onCheckIn,
  onCheckOut,
  onSelectStudent,
  onAddStudent,
  onViewToday,

  // Pagination props supplied by parent
  page = 1,
  pageSize = 25,
  totalStudents = 0,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalStudents / pageSize)
  );

  const start = totalStudents === 0
    ? 0
    : (page - 1) * pageSize + 1;

  const end = Math.min(
    page * pageSize,
    totalStudents
  );

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

      {/* Pagination summary and page-size selector */}
      <div className="student-pagination-toolbar">
        <span>
          {isLoading
            ? "Loading students..."
            : `Showing ${start}–${end} of ${totalStudents} students`
          }
        </span>

        <label>
          Students per page:{" "}
          <select
            value={pageSize}
            onChange={(e) =>
              onPageSizeChange?.(Number(e.target.value))
            }
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      {/* Student cards */}
      {isLoading ? (
        <p>Loading students...</p>
      ) : (
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

          {students.length === 0 && (
            <p>No students found.</p>
          )}
        </div>
      )}

      {/* Previous / Next buttons */}
      <div className="student-pagination-controls">
        <button
          type="button"
          disabled={page <= 1 || isLoading}
          onClick={() => onPageChange?.(page - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page >= totalPages || isLoading}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

export default StudentList;
