
import { useEffect, useRef, useState } from "react";
import {
  updateStudentBelt,
  updateSessionDebrief
} from "../api/api";
import StudentTags from "./StudentTags";
import { useStudentTags } from "../queries/useStudentTags";

function TodayDetailsCard({
  student,
  onSave,
  onRefresh
}) {
  const { tags } = useStudentTags(student.student_id);

  const [isOpen, setIsOpen] = useState(false);
  const [savingDebrief, setSavingDebrief] = useState(false);
  const [savingSession, setSavingSession] = useState(false);

  const [formData, setFormData] = useState({
  belt: student.belt || "",
  notes: student.notes || "",
  achievements: student.achievements || "",
  next_session: student.next_session || "",
  debrief_method: student.debrief_method || ""
});

  const [debriefCompleted, setDebriefCompleted] = useState(
    student.debrief_completed === true
  );

  const debriefStatusRef = useRef(
    student.debrief_completed === true
  );

  const savingDebriefRef = useRef(false);

  // Restore the saved debrief status when a different
  // session loads or fresh student data arrives.
  useEffect(() => {
    if (!savingDebriefRef.current) {
      const savedStatus = student.debrief_completed === true;

      debriefStatusRef.current = savedStatus;
      setDebriefCompleted(savedStatus);
    }
  }, [student.session_id, student.debrief_completed]);

  // Synchronize editable session fields.
  useEffect(() => {
    setFormData({
      belt: student.belt || "",
      notes: student.notes || "",
      achievements: student.achievements || "",
      next_session: student.next_session || ""
    });
  }, [
    student.session_id,
    student.belt,
    student.notes,
    student.achievements,
    student.next_session
  ]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function toggleDebrief(event) {
    event.stopPropagation();

    if (savingDebriefRef.current || savingSession) {
      return;
    }

    const previousStatus = debriefStatusRef.current;
    const newStatus = !previousStatus;

    // Update the UI immediately.
    debriefStatusRef.current = newStatus;
    setDebriefCompleted(newStatus);

    savingDebriefRef.current = true;
    setSavingDebrief(true);

    try {
      const result = await updateSessionDebrief(
        student.session_id,
        newStatus
      );
      await onRefresh();

      const savedStatus = result.debrief_completed;

      if (typeof savedStatus !== "boolean") {
        throw new Error("Invalid debrief status from API");
      }

      debriefStatusRef.current = savedStatus;
      setDebriefCompleted(savedStatus);

      console.log("Debrief saved:", {
        session_id: student.session_id,
        debrief_completed: savedStatus
      });

    } catch (error) {
      // Roll back if the request fails.
      debriefStatusRef.current = previousStatus;
      setDebriefCompleted(previousStatus);

      console.error("Failed to save debrief:", error);
      alert("Could not save debrief status.");

    } finally {
      savingDebriefRef.current = false;
      setSavingDebrief(false);
    }
  }

  
async function handleSave() {
  if (savingSession || savingDebriefRef.current) {
    return;
  }

  setSavingSession(true);

  try {
    if (formData.belt !== student.belt) {
      await updateStudentBelt(
        student.student_id,
        formData.belt
      );
    }

    const sessionData = {
      notes: formData.notes,
      achievements: formData.achievements,
      next_session: formData.next_session,
      debrief_method: formData.debrief_method,
      debrief_completed: debriefStatusRef.current
    };

    const sessionSaved = await onSave(
      student.session_id,
      sessionData
    );

    if (!sessionSaved) {
      throw new Error("Server did not confirm save");
    }

    await onRefresh();

    window.alert(
      `Changes for ${student.first_name} ${student.last_name} were sent successfully!`
    );

  } catch (error) {
    console.error("Failed to save session:", error);

    window.alert(
      `Save failed for ${student.first_name} ${student.last_name}.\n\n` +
      "Your changes may not have been saved. Please try again."
    );

  } finally {
    setSavingSession(false);
  }
}


   
  return (
    <div
      className={`today-details-card ${
        debriefCompleted ? "debrief-complete" : ""
      }`}
    >
      <div
        className="today-card-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="today-student-title">
          <h2>
            {student.first_name} {student.last_name}
          </h2>

          <span className="today-program">
            {student.program}
          </span>

          <span className="today-belt-label">
            Belt: {student.belt}
          </span>

          <StudentTags tags={tags} />

          <span className="today-belt-label">
            {student.email}
          </span>
        </div>

        <div className="today-card-header-right">
          <div className="debrief-control">
            <span className="today-belt-label">
              {student.debrief_method === "in_person"
                ? "In Person"
                : student.debrief_method === "email"
                ? "Email"
                : "Not Set"}
            </span>

            <span className="detail-label">
              Debrief Complete
            </span>

            <button
              className={`checkin-toggle ${
                debriefCompleted ? "active" : ""
              }`}
              onClick={toggleDebrief}
              disabled={savingDebrief || savingSession}
              aria-pressed={debriefCompleted}
              aria-label="Toggle debrief completion"
              type="button"
            >
              <span className="toggle-circle"></span>
            </button>
          </div>

          <span className="collapse-arrow">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </div>

      

      {isOpen && (
        <div className="today-card-content">


          <div className="today-field">
            <label className="detail-label" htmlFor={`debrief-${student.session_id}`}>
              Debrief Method
            </label>

            <select
              id={`debrief-${student.session_id}`}
              name="debrief_method"
              value={formData.debrief_method}
              onChange={handleChange}
            >
              <option value="">Not Set</option>
              <option value="in_person">In Person</option>
              <option value="email">Email</option>
            </select>
          </div>

          <div className="today-belt">
            <label className="detail-label">
              Belt
            </label>

            <input
              name="belt"
              value={formData.belt}
              onChange={handleChange}
            />
          </div>

          <div className="today-field">
            <label className="detail-label">
              Notes
            </label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add notes about today's session..."
            />
          </div>

          <div className="today-field">
            <label className="detail-label">
              Achievements
            </label>

            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              placeholder="What did they accomplish today?"
            />
          </div>

          <div className="today-field">
            <label className="detail-label">
              Next Session
            </label>

            <textarea
              name="next_session"
              value={formData.next_session}
              onChange={handleChange}
              placeholder="What should they work on next?"
            />
          </div>

          <div className="today-card-actions">
            <button
              className="back-button"
              onClick={handleSave}
              disabled={savingSession || savingDebrief}
              type="button"
            >
              {savingSession ? "Saving..." : "Update"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodayDetailsCard;
