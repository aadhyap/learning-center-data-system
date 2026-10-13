
import { useEffect, useState } from "react";
import TodayDetailsCard from "./components/TodayDetailsCard";
import { finalizeDay } from "./api/finalizeDay";
import { exportToday } from "./api/exportData";

function TodayStudents({
  todayStudents,
  onSaveSession,
  loadTodayStudents,
  loadStudents,
  onBack
}) {
  const [now, setNow] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
  loadTodayStudents();
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const pacificDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(now);

  const pacificTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);

  const [hour, minute] = pacificTime.split(":").map(Number);

  const canSave =
    hour === 17 && minute >= 50;

    async function handleExportToday() {
    setExporting(true);
    setError("");

    try {
      await exportToday();
    } catch (err) {
      setError(err.message || "Failed to export today's students.");
    } finally {
      setExporting(false);
    }
  }

  async function handleSaveDay() {
    if (!window.confirm("Finalize today's sessions? This cannot be undone.")) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await finalizeDay();

      await Promise.all([
        loadTodayStudents(),
        loadStudents()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const completedDebriefs = todayStudents.filter(
  (student) => student.debrief_completed === true
).length;

  return (
    <div className="today-page">
      <div className="page-header today-page-header">
        <div>
          <h1>Today's Students</h1>
          <p>{pacificDate}</p>
        </div>

        <button
          type="button"
          className="today-students-button"
          onClick={handleExportToday}
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "↓ Export Today"}
        </button>

        <button
          className="back-button today-back-button"
          onClick={onBack}
          type="button"
        >
          All Students <span>→</span>
        </button>
      </div>

      
      <div className="today-dashboard">
        <div>
          <p>Students Checked In Today</p>
          <h2>{todayStudents.length}</h2>
        </div>

        <div>
          <p>Debriefs Completed</p>
          <h2>
            {completedDebriefs} / {todayStudents.length}
          </h2>
        </div>

        <div className="today-save">
          <p>Automatic save at 6:00 PM Pacific</p>

          <button
            type="button"
            disabled={!canSave || saving || todayStudents.length === 0}
            onClick={handleSaveDay}
          >
            {saving ? "Saving..." : "Save Day"}
          </button>
        </div>
      </div>


      {error && <p className="error-message">{error}</p>}

      <div className="today-content">
        {todayStudents.length === 0 ? (
          <p>No students checked in today.</p>
        ) : (
          
          [...todayStudents]
            .sort((a, b) => {
              const timeA = new Date(a.session_date).getTime();
              const timeB = new Date(b.session_date).getTime();

              return timeB - timeA;
            })
            .map((student) => (
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
