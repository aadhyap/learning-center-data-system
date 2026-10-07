function TodayStudents({
  todayStudents,
  onBack
}) {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });


  return (
    <div className="today-page">

      <div className="page-header">
        <div>
          <h1>Today's Students</h1>
          <p>{formattedDate}</p>
        </div>
      </div>

      <div className="today-content">

                {todayStudents.length === 0 ? (
                <p>No students checked in today.</p>
                ) : (
                todayStudents.map((student) => (
                <div
                        className="today-student-card"
                        key={student.session_id}
                >
                        <div>
                        <h2>
                        {student.first_name} {student.last_name}
                        </h2>

                        <p>
                        {student.program} · {student.belt}
                        </p>
                        </div>

                        <span>
                        Session #{student.session_id}
                        </span>
                </div>
                ))
                )}

      </div>

      <button
        className="back-button today-back-button"
        onClick={onBack}
      >
        Back to All Students →
      </button>

    </div>
  );
}

export default TodayStudents;