function TodayStudents({ onBack }) {
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
        <p>Checked-in students will appear here.</p>
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