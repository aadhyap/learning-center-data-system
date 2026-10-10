
import { useState } from "react";

const TAG_OPTIONS = [
  { value: "needs_attention", label: "Needs Attention" },
  { value: "easily_distracted", label: "Easily Distracted" },
  { value: "coming_from_break", label: "Coming from Break" }
];

function AddStudent({ onBack, onCreate }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    program: "",
    belt: "",
    email: "",
    debrief_method: "",
    summary: ""
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function toggleTag(tagName) {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    );
  }

  
async function handleSubmit(event) {
  event.preventDefault();

  if (isSaving) return;

  setIsSaving(true);

  try {
    const success = await onCreate(formData, selectedTags);

    if (success) {
      onBack();
    } else {
      alert("Failed to create student. Please try again.");
    }
  } catch (error) {
    console.error("Failed to create student:", error);
    alert("Failed to create student. Please try again.");
  } finally {
    setIsSaving(false);
  }
}

  return (
    <div className="add-student-form">

      <div className="add-student-header">
        <h2>Add Student</h2>

        <button
          type="button"
          className="modal-close"
          onClick={onBack}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="profile-details">

          <div>
            <label className="detail-label">First Name *</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="detail-label">Last Name *</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="detail-label">Username *</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="detail-label">Program</label>
            <input
              name="program"
              value={formData.program}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="detail-label">Belt</label>
            <input
              name="belt"
              value={formData.belt}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="detail-label">Email (Optional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="profile-field">
          <label className="detail-label">Debrief Method</label>
          <select
            name="debrief_method"
            value={formData.debrief_method}
            onChange={handleChange}
          >
            <option value="">Not Set</option>
            <option value="in_person">In Person</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div className="profile-field">
          <label className="detail-label">Notes</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="General notes about this student..."
          />
        </div>

        <div className="profile-field">
          <label className="detail-label">Tags (Optional)</label>

          <div className="selected-tags">
            {TAG_OPTIONS.map(tag => (
              <label
                key={tag.value}
                className={`student-tag tag-${tag.value}`}
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.value)}
                  onChange={() => toggleTag(tag.value)}
                />
                {tag.label}
              </label>
            ))}
          </div>
        </div>

        <button
        className="back-button"
        type="submit"
        disabled={isSaving}
        >
        {isSaving ? "Creating..." : "Create Student"}

        </button>

      </form>
    </div>
  );
}

export default AddStudent;
