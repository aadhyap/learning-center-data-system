import { authFetch } from "./authFetch";

async function downloadExport(path, fallbackName) {
  const response = await authFetch(path);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || `Export failed (${response.status})`);
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToday() {
  return downloadExport("/export/today", "student_attendance_today.xlsx");
}

export function exportAllData() {
  return downloadExport("/export/all", "student_progress_full_export.xlsx");
}