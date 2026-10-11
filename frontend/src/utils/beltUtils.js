export function parseBelt(belt = "") {
  const parts = belt.split("_");

  if (parts[0]?.toLowerCase() === "black") {
    return {
      color: "Black",
      specialization: parts[1] || null,
      rank: parts[2] || null
    };
  }

  return {
    color: parts[0] || null,
    level: parts[1] || null,
    specialization: null,
    rank: null
  };
}