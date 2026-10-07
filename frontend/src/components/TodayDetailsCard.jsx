import { useState } from "react";

function TodayDetailsCard({ student }) {
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
    // Prevent this click from also opening/closing the card
    event.stopPropagation();

    setFormData({
      ...formData,
      debrief_completed: !formData.debrief_completed
    });
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
        <div>
        <h2>
        {student.first_name} {student.last_name}
        </h2>

        <p>{student.program}</p>
        </div>

        <div className="today-card-header-right">

        <div className="debrief-control">
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

        </div>
      )}

    </div>
  );
}

export default TodayDetailsCard;