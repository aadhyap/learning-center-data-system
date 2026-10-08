import { useState } from "react";

function TodayDetailsCard({
  student,
  onSave
}) {
  const [isOpen, setIsOpen] = useState(true);

  const [formData, setFormData] = useState({
    belt: student.belt || "",
    notes: student.notes || "",
    achievements: student.achievements || "",
    next_session: student.next_session || "",
    debrief_completed: student.debrief_completed || false
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  function toggleDebrief(event) {
    // Don't open/close the card when clicking the toggle
    event.stopPropagation();

    setFormData({
      ...formData,
      debrief_completed: !formData.debrief_completed
    });
  }

  async function handleSave() {
    const sessionData = {
      notes: formData.notes,
      achievements: formData.achievements,
      next_session: formData.next_session,
      debrief_completed: formData.debrief_completed
    };

    const success = await onSave(
      student.session_id,
      sessionData
    );

    if (success) {
      console.log("Session saved!");
    }
  }

  return (
    <div
      className={`today-details-card ${
        formData.debrief_completed ? "debrief-complete" : ""
      }`}
    >

      <div
        className="today-card-header"
        onClick={() => setIsOpen(!isOpen)}
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

                

                <span className="today-belt-label">
                 {student.email}
                </span>
        </div>

        <div className="today-card-header-right">

          <div className="debrief-control">
            <span className="today-belt-label">
                 {student.debrief_method}
                </span>
            <span className="detail-label">
              Debrief Complete
            </span>

            <button
              className={`checkin-toggle ${
                formData.debrief_completed ? "active" : ""
              }`}
              onClick={toggleDebrief}
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
              type="button"
            >
              Update
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

export default TodayDetailsCard;