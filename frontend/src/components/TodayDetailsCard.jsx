import { useState } from "react";

function TodayDetailsCard({ student }) {
  const [isOpen, setIsOpen] = useState(true);

  const [formData, setFormData] = useState({
    belt: student.belt || "",
    notes: student.notes || "",
    achievements: student.achievements || "",
    next_session: student.next_session || ""
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value
    });
  }

  return (
    <div className="today-details-card">

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