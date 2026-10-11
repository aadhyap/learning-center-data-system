
import { useState } from "react";
import {
  BELT_COLORS,
  TRACKS,
  TRACK_RANKS,
  buildBelt,
  validateStudent
} from "../utils/studentValidation";

const TAG_OPTIONS = [
  { value: "needs_attention", label: "Needs Attention" },
  { value: "easily_distracted", label: "Easily Distracted" },
  { value: "coming_from_break", label: "Coming from Break" }
];

function AddStudent({ onBack, onCreate }) {
  const [beltType, setBeltType] = useState("standard");
  const [beltColor, setBeltColor] = useState("");
  const [beltLevel, setBeltLevel] = useState("");
  const [track, setTrack] = useState("");
  const [rank, setRank] = useState("");
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
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

  const belt =
    formData.program === "CREATE"
      ? buildBelt({
          beltColor: beltType === "standard" ? beltColor : "",
          beltLevel: beltType === "standard" ? beltLevel : "",
          track: beltType === "track" ? track : "",
          rank: beltType === "track" ? rank : ""
        })
      : formData.belt.trim();

  const studentData = {
    ...formData,
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    email: formData.email
      .split(",")
      .map(email => email.trim())
      .filter(Boolean)
      .join(", "),
    belt
  };

  const validationErrors = validateStudent(studentData);

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setErrors({});
  setIsSaving(true);

  try {
    const success = await onCreate(studentData, selectedTags);

    if (success) {
      onBack();
    } else {
      setErrors({
        submit: "Could not create student. Please try again."
      });
    }
  } catch (error) {
    console.error("Failed to create student:", error);

    setErrors({
      submit: error.message || "Failed to create student."
    });
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
            <label className="detail-label">Program</label>
            <select
                name="program"
                value={formData.program}
                onChange={(e) => {
                setFormData(prev => ({
                ...prev,
                program: e.target.value,
                belt: ""
                }));

                setBeltColor("");
                setBeltLevel("");
                setTrack("");
                setRank("");
                setBeltType("standard");
                setErrors({});
                }}
                required
                >
                <option value="">Select Program</option>
                <option value="CREATE">CREATE</option>
                <option value="Junior">Junior</option>
                <option value="Robotics">Robotics</option>
            </select>
        {errors.program && <p className="field-error">{errors.program}</p>}
          </div>

          
<div>
  <label className="detail-label">Belt *</label>

  {!formData.program && (
  <select disabled value="">
    <option value="">Select a program first</option>
  </select>
)}

  {formData.program === "CREATE" && (
    <>
      <select
        value={beltType}
        onChange={(e) => {
          setBeltType(e.target.value);
          setBeltColor("");
          setBeltLevel("");
          setTrack("");
          setRank("");
        }}
      >
        <option value="standard">Standard Belt</option>
        <option value="track">Unity / Godot</option>
      </select>

      {beltType === "standard" ? (
        <>
          <select
            value={beltColor}
            onChange={(e) => setBeltColor(e.target.value)}
          >
            <option value="">Select Color</option>
            {BELT_COLORS.map(color => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          <select
            value={beltLevel}
            onChange={(e) => setBeltLevel(e.target.value)}
          >
            <option value="">No Level</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(level => (
              <option key={level} value={level}>
                Level {level}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
          >
            <option value="">Select Track</option>
            {TRACKS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={rank}
            onChange={(e) => setRank(e.target.value)}
          >
            <option value="">No Rank</option>
            {TRACK_RANKS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </>
      )}
    </>
  )}

  {formData.program === "Junior" && (
    <input
      name="belt"
      value={formData.belt}
      onChange={handleChange}
      placeholder="Junior belt"
    />
  )}

  {formData.program === "Robotics" && (
    <select
      name="belt"
      value={formData.belt}
      onChange={handleChange}
    >
      <option value="">Select Robotics Level</option>
      <option value="Jr Robotics">Junior Robotics</option>
      <option value="Int Robotics">Intermediate Robotics</option>
      <option value="Adv Robotics">Advanced Robotics</option>
    </select>
  )}

  {errors.belt && <p className="field-error">{errors.belt}</p>}
</div>


          <div>
            <label className="detail-label">Email (Optional)</label>
            <input
                type="email"
                multiple
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="parent1@email.com, parent2@email.com"
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

        {errors.submit && (
  <p className="field-error">{errors.submit}</p>
)}

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
