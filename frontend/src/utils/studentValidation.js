
export const BELT_COLORS = [
  "White", "Yellow", "Orange", "Green",
  "Blue", "Purple", "Brown", "Red"
];

export const TRACKS = ["Unity", "Godot"];

export const TRACK_RANKS = [
  "Black", "Bronze", "Silver", "Gold", "Platinum"
];

export function buildBelt({ beltColor, beltLevel, track, rank }) {
  if (track) {
    return rank ? `${track}_${rank}` : track;
  }

  if (beltColor) {
    return beltLevel ? `${beltColor}_${beltLevel}` : beltColor;
  }

  return "";
}

export function validateStudent(data) {
  const errors = {};

  if (!data.first_name.trim()) {
    errors.first_name = "First name is required.";
  }

  if (!data.last_name.trim()) {
    errors.last_name = "Last name is required.";
  }

  if (!["CREATE", "Junior", "Robotics"].includes(data.program)) {
    errors.program = "Select a valid program.";
  }

  if (!data.belt) {
    errors.belt = "Select a belt or level.";
  }

  if (data.email.trim()) {
    const emails = data.email.split(",").map(e => e.trim());

    if (emails.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      errors.email = "Enter valid email addresses separated by commas.";
    }
  }

  return errors;
}
