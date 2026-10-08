
import { useEffect, useState } from "react";

import SessionHistory from "./SessionHistory";
import StudentTags from "./StudentTags";

import { useStudentHistory } from "../queries/useStudentHistory";
import { useStudentTags } from "../queries/useStudentTags";
import { addSessionTag, expireSessionTag } from "../api/api";

const TAG_OPTIONS = [
  "needs_attention",
  "easily_distracted",
  "coming_from_break"
];

function StudentProfile({ student, onBack, onSave }) {
  const { tags, loadTags } = useStudentTags(student.student_id);
  const { sessions } = useStudentHistory(student.student_id);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [tagToAdd, setTagToAdd] = useState("");

  const [formData, setFormData] = useState({
    first_name: student.first_name,
    last_name: student.last_name,
    program: student.program || "",
    belt: student.belt || "",
    summary: student.summary || "",
    debrief_method: student.debrief_method || ""
  });

  // Keep displayed tags synchronized with the backend.
  useEffect(() => {
    if (!isEditing) {
      setSelectedTags(tags.map(tag => tag.tag_name));
    }
  }, [tags, isEditing]);

  // Reset form when switching students.
  useEffect(() => {
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      program: student.program || "",
      belt: student.belt || "",
      summary: student.summary || "",
      debrief_method: student.debrief_method || ""
    });

    setIsEditing(false);
    setTagToAdd("");
  }, [student.student_id]);

  function resetForm() {
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      program: student.program || "",
      belt: student.belt || "",
      summary: student.summary || "",
      debrief_method: student.debrief_method || ""
    });

    setSelectedTags(tags.map(tag => tag.tag_name));
    setTagToAdd("");
  }

  function handleEdit() {
    if (isEditing) {
      resetForm();
      setIsEditing(false);
    } else {
      resetForm();
      setIsEditing(true);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleSelectTag(event) {
    const tagName = event.target.value;

    if (tagName && !selectedTags.includes(tagName)) {
      setSelectedTags(prev => [...prev, tagName]);
    }

    setTagToAdd("");
  }

  function removeTag(tagName) {
    setSelectedTags(prev =>
      prev.filter(tag => tag !== tagName)
    );
  }

  async function handleSave() {
    if (isSaving) return;

    const updatedStudent = {
      username: student.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: student.email,
      program: formData.program,
      belt: formData.belt,
      debrief_method: formData.debrief_method,
      summary: formData.summary
    };

    const tagsToAdd = selectedTags.filter(
      tagName => !tags.some(tag => tag.tag_name === tagName)
    );

    const tagsToRemove = tags.filter(
      tag => !selectedTags.includes(tag.tag_name)
    );

    const latestSession = [...(sessions || [])].sort(
      (a, b) =>
        new Date(b.session_date) - new Date(a.session_date)
    )[0];

    if (tagsToAdd.length > 0 && !latestSession) {
      alert("This student needs a session before adding tags.");
      return;
    }

    setIsSaving(true);

    try {
      const success = await onSave(
        student.student_id,
        updatedStudent
      );

      if (!success) {
        throw new Error("Student information could not be saved");
      }

      for (const tagName of tagsToAdd) {
        await addSessionTag(latestSession.session_id, tagName);
      }

      for (const tag of tagsToRemove) {
        await expireSessionTag(tag.tag_id);
      }

      await loadTags();
      setIsEditing(false);

    } catch (error) {
      console.error("Failed to save student profile:", error);
      alert("Some changes could not be saved. Please try again.");

      try {
        await loadTags();
      } catch (refreshError) {
        console.error("Failed to refresh tags:", refreshError);
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="student-profile">

      <button
        className="back-button"
        onClick={onBack}
      >
        ← Back to Students
      </button>

      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div>
            {isEditing ? (
              <div className="name-inputs">
                <input
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />

                <input
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            ) : (
              <h1>
                {student.first_name} {student.last_name}
              </h1>
            )}

            <p>@{student.username}</p>
          </div>

          <button
            className="back-button"
            onClick={handleEdit}
            disabled={isSaving}
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* PROGRAM AND BELT */}
        <div className="profile-details">

          <div>
            <span className="detail-label">Program</span>

            {isEditing ? (
              <input
                name="program"
                value={formData.program}
                onChange={handleChange}
              />
            ) : (
              <p>{student.program}</p>
            )}
          </div>

          <div>
            <span className="detail-label">Belt</span>

            {isEditing ? (
              <input
                name="belt"
                value={formData.belt}
                onChange={handleChange}
              />
            ) : (
              <p>{student.belt}</p>
            )}
          </div>

        </div>

        {/* DEBRIEF METHOD */}
        <div className="profile-field">
          <label className="detail-label">
            Debrief Method
          </label>

          {isEditing ? (
            <select
              name="debrief_method"
              value={formData.debrief_method}
              onChange={handleChange}
            >
              <option value="">Not Set</option>
              <option value="in_person">In Person</option>
              <option value="email">Email</option>
            </select>
          ) : (
            <p>
              {student.debrief_method === "in_person"
                ? "In Person"
                : student.debrief_method === "email"
                ? "Email"
                : "Not Set"}
            </p>
          )}
        </div>

        {/* ACTIVE TAGS */}
        <div className="profile-tags">
          <span className="detail-label">
            Active Tags
          </span>

          {isEditing ? (
            <div className="tag-editor">

              <select
                value={tagToAdd}
                onChange={handleSelectTag}
              >
                <option value="">
                  Select a tag...
                </option>

                {TAG_OPTIONS
                  .filter(tagName => !selectedTags.includes(tagName))
                  .map(tagName => (
                    <option key={tagName} value={tagName}>
                      {tagName.replaceAll("_", " ")}
                    </option>
                  ))}
              </select>

              <div className="selected-tags">
                {selectedTags.map(tagName => (
                  <span
                    className="student-tag"
                    key={tagName}
                  >
                    {tagName.replaceAll("_", " ")}

                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(tagName)}
                      aria-label={`Remove ${tagName.replaceAll("_", " ")}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

            </div>
          ) : (
            <StudentTags tags={tags} />
          )}
        </div>

        {/* SUMMARY */}
        <div className="profile-summary">
          <span className="detail-label">
            Summary
          </span>

          {isEditing ? (
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
            />
          ) : (
            <p>
              {student.summary || "No summary yet."}
            </p>
          )}
        </div>

        {/* SAVE */}
        {isEditing && (
          <button
            className="back-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}

      </div>

      {/* SESSION HISTORY */}
      <h2 className="history-title">
        Session History
      </h2>

      <SessionHistory sessions={sessions} />

    </div>
  );
}

export default StudentProfile;
