
function StudentFilters({ filters, setFilters }) {
  function update(key, value) {
    setFilters((previous) => ({
      ...previous,
      [key]: value
    }));
  }

  function changeProgram(value) {
    setFilters((previous) => ({
      ...previous,
      program: value,
      beltColor: "all",
      track: "all",
      rank: "all",
      roboticsLevel: "all"
    }));
  }

  function changeTrack(value) {
    setFilters((previous) => ({
      ...previous,
      track: value,
      beltColor: "all",
      rank: "all"
    }));
  }

  function changeBeltColor(value) {
    setFilters((previous) => ({
      ...previous,
      beltColor: value,
      track: "all",
      rank: "all"
    }));
  }

  return (
    <div className="student-filters">
      <h3>Filters</h3>

      <p>Program</p>
      <select
        value={filters.program}
        onChange={(e) => changeProgram(e.target.value)}
      >
        <option value="all">All Programs</option>
        <option value="CREATE">CREATE</option>
        <option value="Junior">Junior</option>
        <option value="Robotics">Robotics</option>
      </select>

      {(filters.program === "CREATE" || filters.program === "all") && (
        <>
          <p>Standard Belt Color</p>
          <select
            value={filters.beltColor}
            onChange={(e) => changeBeltColor(e.target.value)}
          >
            <option value="all">All Colors</option>
            {[
              "White", "Yellow", "Orange", "Green",
              "Blue", "Purple", "Brown", "Red"
            ].map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          <p>Unity / Godot</p>
          <select
            value={filters.track}
            onChange={(e) => changeTrack(e.target.value)}
          >
            <option value="all">All Tracks</option>
            <option value="Unity">All Unity</option>
            <option value="Godot">All Godot</option>
          </select>

          {filters.track !== "all" && (
            <>
              <p>Rank</p>
              <select
                value={filters.rank}
                onChange={(e) => update("rank", e.target.value)}
              >
                <option value="all">All Ranks</option>
                {["Black", "Bronze", "Silver", "Gold", "Platinum"].map(
                  (rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  )
                )}
              </select>
            </>
          )}
        </>
      )}

      {filters.program === "Robotics" && (
        <>
          <p>Robotics Level</p>
          <select
            value={filters.roboticsLevel}
            onChange={(e) =>
              update("roboticsLevel", e.target.value)
            }
          >
            <option value="all">All Robotics</option>
            <option value="Jr">Junior Robotics</option>
            <option value="Int">Intermediate Robotics</option>
            <option value="Adv">Advanced Robotics</option>
          </select>
        </>
      )}

      <p>Attendance</p>
      <select
        value={filters.attendance}
        onChange={(e) => update("attendance", e.target.value)}
      >
        <option value="all">All Students</option>
        <option value="attended">Attended Before</option>
        <option value="never">Never Attended</option>
      </select>

      <p>Sort By</p>
      <select
        value={filters.sortBy}
        onChange={(e) => update("sortBy", e.target.value)}
      >
        <option value="name">Name A–Z</option>
        <option value="recent">Most Recent</option>
        <option value="oldest">Least Recent</option>
      </select>

      <button
        type="button"
        onClick={() =>
          setFilters({
            search: "",
            program: "all",
            beltColor: "all",
            track: "all",
            rank: "all",
            roboticsLevel: "all",
            attendance: "all",
            sortBy: "name"
          })
        }
      >
        Clear Filters
      </button>
    </div>
  );
}

export default StudentFilters;
