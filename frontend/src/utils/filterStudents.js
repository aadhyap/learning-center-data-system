
const TRACKS = ["unity", "godot"];

function parseBelt(value) {
  const parts = (value || "")
    .trim()
    .toLowerCase()
    .split("_");

  if (TRACKS.includes(parts[0])) {
    return {
      track: parts[0],
      color: null,
      rank: parts[1] || null,
      level: null
    };
  }

  return {
    track: null,
    color: parts[0] || null,
    rank: null,
    level: parts[1] || null
  };
}

export function filterStudents(students, filters) {
  const filtered = students.filter((student) => {
    const fullName =
      `${student.first_name} ${student.last_name}`.toLowerCase();

    const belt = parseBelt(student.belt);
    const program = (student.program || "").toLowerCase();

    if (
      !fullName.includes((filters.search || "").trim().toLowerCase())
    ) {
      return false;
    }

    if (
      filters.program !== "all" &&
      program !== filters.program.toLowerCase()
    ) {
      return false;
    }

    // White matches White_1, White_3, White_4, etc.
    if (
      filters.beltColor !== "all" &&
      belt.color !== filters.beltColor.toLowerCase()
    ) {
      return false;
    }

    // Unity matches Unity_Black, Unity_Gold, etc.
    if (
      filters.track !== "all" &&
      belt.track !== filters.track.toLowerCase()
    ) {
      return false;
    }

    // Rank applies to Unity/Godot
    if (
      filters.rank !== "all" &&
      belt.rank !== filters.rank.toLowerCase()
    ) {
      return false;
    }

    if (
      filters.roboticsLevel !== "all" &&
      !(student.belt || "")
        .toLowerCase()
        .includes(filters.roboticsLevel.toLowerCase())
    ) {
      return false;
    }

    if (
      filters.attendance === "never" &&
      student.last_session
    ) {
      return false;
    }

    if (
      filters.attendance === "attended" &&
      !student.last_session
    ) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    if (
      filters.sortBy === "recent" ||
      filters.sortBy === "oldest"
    ) {
      if (!a.last_session && !b.last_session) return 0;
      if (!a.last_session) return 1;
      if (!b.last_session) return -1;

      const difference =
        new Date(b.last_session) - new Date(a.last_session);

      return filters.sortBy === "recent"
        ? difference
        : -difference;
    }

    return `${a.first_name} ${a.last_name}`.localeCompare(
      `${b.first_name} ${b.last_name}`
    );
  });
}
