const TAG_LABELS = {
  coming_from_break: "Coming from Break",
  needs_attention: "Needs Attention",
  easily_distracted: "Easily Distracted",
};

export default function StudentTags({ tags = [] }) {
  if (tags.length === 0) return null;

  return (
    <div className="student-tags">
      {tags.map((tag) => (
        <span className="student-tag" key={tag.tag_id}>
          {TAG_LABELS[tag.tag_name]}
        </span>
      ))}
    </div>
  );
}