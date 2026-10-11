import TodayDetailsCard from "./components/TodayDetailsCard";


function TodayStudents({
  todayStudents,
  onSaveSession,
  loadTodayStudents,
  loadStudents,
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

      <div className="page-header today-page-header">
        <div>
          <h1>Today's Students</h1>
          <p>{formattedDate}</p>
        </div>

        <button
        className="back-button today-back-button"
        onClick={onBack}
        type="button"
      >
        All Students <span>→</span>
      </button>
      </div>

      <div className="today-content">

        {todayStudents.length === 0 ? (
          <p>No students checked in today.</p>
        ) : (
          todayStudents.map((student) => (
            <TodayDetailsCard
              key={student.session_id}
              student={student}
              onSave={onSaveSession}
              onRefresh={async () => {
                await Promise.all([
                  loadTodayStudents(),
                  loadStudents()
                ]);
              }}
            />
          ))
        )}

      </div>


    </div>
  );
}

export default TodayStudents;