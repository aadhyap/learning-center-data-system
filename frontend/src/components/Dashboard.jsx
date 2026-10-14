
import "./Dashboard.css";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { authFetch } from "../api/authFetch";

const COLORS = [
  "#64748b",
  "#2563eb",
  "#0d9488",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#84cc16",
  "#ec4899"
];

const BELT_COLORS = {
  White: "#F1F5F9",
  Yellow: "#FACC15",
  Orange: "#F97316",
  Green: "#22C55E",
  Blue: "#3B82F6",
  Purple: "#A855F7",
  Brown: "#92400E",
  Red: "#EF4444",
  Black: "#171717",
  Bronze: "#CD7F32",
  Silver: "#94A3B8",
  Gold: "#EAB308",
  Platinum: "#A3A3A3",
  Unspecified: "#CBD5E1",
  Other: "#64748B"
};

const BELT_ORDER = [
  "White",
  "Yellow",
  "Orange",
  "Green",
  "Blue",
  "Purple",
  "Brown",
  "Red",
  "Black",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum"
];

const TZ = "America/Los_Angeles";
const DAY_MS = 86400000;
const CACHE_KEY = "student-dashboard-v1";

// Version 2 invalidates the old weekday averages.
const CACHE_VERSION = 2;

function pacificDate(value) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(d);

  const get = (type) =>
    Number(parts.find((p) => p.type === type)?.value);

  return Date.UTC(
    get("year"),
    get("month") - 1,
    get("day")
  );
}

function weekStart(day) {
  const weekday = new Date(day).getUTCDay();
  return day - ((weekday + 6) % 7) * DAY_MS;
}

function labelWeek(day) {
  return new Date(day).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric"
  });
}

function getCachedDashboard() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);

    if (
      cached.version !== CACHE_VERSION ||
      cached.date !== pacificDate(new Date())
    ) {
      return null;
    }

    return cached.data || null;
  } catch (error) {
    console.error("Dashboard cache error:", error);
    return null;
  }
}

function saveDashboardCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        version: CACHE_VERSION,
        date: pacificDate(new Date()),
        data
      })
    );
  } catch (error) {
    console.error("Could not save dashboard cache:", error);
  }
}

function countBy(items, keyFn) {
  const counts = new Map();

  for (const item of items) {
    const key = keyFn(item);

    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return [...counts]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// Group individual belt levels by belt color.
// Green_1, Green_2 -> Green
// Unity_Gold, Godot_Gold -> Gold

function getBeltColor(student) {
  if (!student.belt) {
    return "Unspecified";
  }

  const parts = student.belt.split("_");

  const color = parts.find((part) =>
    BELT_ORDER.some(
      (belt) =>
        belt.toLowerCase() === part.toLowerCase()
    )
  );

  return color
    ? BELT_ORDER.find(
        (belt) =>
          belt.toLowerCase() === color.toLowerCase()
      )
    : "Other";
}

async function fetchJson(url) {
  const response = await authFetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}): ${url}`
    );
  }

  return response.json();
}

function unpackStudents(data) {
  if (Array.isArray(data)) {
    return {
      rows: data,
      total: data.length
    };
  }

  const rows =
    data.students ??
    data.items ??
    data.results ??
    [];

  return {
    rows,
    total:
      data.total ??
      data.total_students ??
      data.count ??
      rows.length
  };
}

// Fetch all students across all pages.

async function fetchAllStudents() {
  const first = unpackStudents(
    await fetchJson("/students?page=1&page_size=100")
  );

  if (!Array.isArray(first.rows)) {
    throw new Error("Unexpected student list response");
  }

  const all = [...first.rows];
  const pages = Math.ceil(first.total / 100);

  for (let page = 2; page <= pages; page++) {
    const next = unpackStudents(
      await fetchJson(
        `/students?page=${page}&page_size=100`
      )
    );

    all.push(...next.rows);
  }

  return all;
}

function unpackHistory(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.sessions)) return data.sessions;
  if (Array.isArray(data.history)) return data.history;
  if (Array.isArray(data.items)) return data.items;

  throw new Error(
    "Unexpected student history response"
  );
}

// Limit concurrent API requests to 5.

async function fetchHistories(students) {
  const results = [];
  let cursor = 0;

  const workers = Array.from(
    { length: Math.min(5, students.length) },
    async () => {
      while (cursor < students.length) {
        const student = students[cursor++];

        const data = await fetchJson(
          `/students/${encodeURIComponent(
            student.student_id
          )}/history`
        );

        const history = unpackHistory(data);

        for (const session of history) {
          results.push({
            ...session,
            student_id: student.student_id
          });
        }
      }
    }
  );

  await Promise.all(workers);

  return results;
}

function getTodayCount(todayStudents) {
  return new Set(
    todayStudents.map((student) => student.student_id)
  ).size;
}

// Calculate all dashboard statistics.

function analyze(students, sessions) {
  const nowDay = pacificDate(new Date());
  const thisMonday = weekStart(nowDay);

  // Four completed Monday-Sunday weeks.
  const previousFourMondays = Array.from(
    { length: 4 },
    (_, i) => thisMonday - (4 - i) * 7 * DAY_MS
  );

  const weeklyCounts = new Map(
    previousFourMondays.map((monday) => [monday, 0])
  );

  // One Set per day, Monday through Sunday.
  // Each Set contains distinct student IDs.
  const weekdaySets = Array.from(
    { length: 7 },
    () => new Set()
  );

  let sessions30 = 0;

  for (const session of sessions) {
    if (!session.session_date) {
      continue;
    }

    const day = pacificDate(session.session_date);

    if (day === null || day > nowDay) {
      continue;
    }

    // Count sessions in the last 30 calendar days.
    if (day >= nowDay - 29 * DAY_MS) {
      sessions30++;
    }

    // Count every session in completed weeks.
    const monday = weekStart(day);

    if (weeklyCounts.has(monday)) {
      weeklyCounts.set(
        monday,
        weeklyCounts.get(monday) + 1
      );
    }

    // CURRENT WEEK ATTENDANCE
    // Count each student once per calendar day.
    if (day >= thisMonday && day <= nowDay) {
      const index = Math.floor(
        (day - thisMonday) / DAY_MS
      );

      weekdaySets[index].add(session.student_id);
    }
  }

  const weekly = previousFourMondays.map((monday) => ({
    name: labelWeek(monday),
    value: weeklyCounts.get(monday)
  }));

  const weeklyAverage =
    weekly.reduce((sum, item) => sum + item.value, 0) / 4;

  // Actual student attendance for the current week.
  // No division by 4.
  const weekday = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun"
  ].map((name, index) => ({
    name,
    value: weekdaySets[index].size
  }));

  const belt = countBy(
    students,
    getBeltColor
  ).sort((a, b) => {
    const aIndex = BELT_ORDER.indexOf(a.name);
    const bIndex = BELT_ORDER.indexOf(b.name);

    return (
      (aIndex === -1 ? BELT_ORDER.length : aIndex) -
      (bIndex === -1 ? BELT_ORDER.length : bIndex)
    );
  });

  return {
    total: students.length,
    weeklyAverage,
    sessions30,

    program: countBy(
      students,
      (student) => student.program || "Unspecified"
    ),

    belt,
    weekday,
    weekly
  };
}

function Stat({ label, value, detail }) {
  return (
    <div className="dashboard-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function ChartPanel({ title, children }) {
  return (
    <section className="dashboard-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function Dashboard({
  onBack,
  todayStudents = []
}) {
  const [data, setData] = useState(
    () => getCachedDashboard()
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(
    () => !getCachedDashboard()
  );

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const cached = getCachedDashboard();

      if (cached) {
        if (active) {
          setData(cached);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError("");

        const students = await fetchAllStudents();
        const sessions = await fetchHistories(students);

        const result = analyze(students, sessions);

        if (active) {
          setData(result);
          saveDashboardCache(result);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Could not load dashboard"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Student Analytics</h1>
          <p>Enrollment, belts, and attendance</p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← All Students
        </button>
      </div>

      {loading && (
        <p role="status">
          Loading analytics and session histories...
        </p>
      )}

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {data && (
        <>
          <div className="dashboard-stats">
            <Stat
              label="Total Students"
              value={data.total}
              detail="In the database"
            />

            <Stat
              label="Checked In Today"
              value={getTodayCount(todayStudents)}
              detail="Distinct students today"
            />

            <Stat
              label="Average Sessions per Week"
              value={data.weeklyAverage.toFixed(1)}
              detail="Last 4 completed weeks"
            />

            <Stat
              label="Sessions in Last 30 Days"
              value={data.sessions30}
              detail="Recorded sessions"
            />
          </div>

          <div className="dashboard-charts">
            <ChartPanel title="Students by Program">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.program}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {data.program.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Students by Belt">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.belt}
                  margin={{
                    bottom: 55,
                    left: 0,
                    right: 12
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    fontSize={10}
                  />

                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Students"
                    radius={[4, 4, 0, 0]}
                  >
                    {data.belt.map((belt) => (
                      <Cell
                        key={belt.name}
                        fill={
                          BELT_COLORS[belt.name] || "#64748B"
                        }
                        stroke={
                          belt.name === "White"
                            ? "#94A3B8"
                            : "none"
                        }
                        strokeWidth={
                          belt.name === "White" ? 1 : 0
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartPanel>

            <ChartPanel title="Attendance This Week">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={data.weekday}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Students"
                    fill="#0d9488"
                  />
                </BarChart>
              </ResponsiveContainer>

              <p className="dashboard-note">
                Distinct students who attended each day
                this week (Monday–Sunday).
              </p>
            </ChartPanel>

            <ChartPanel title="Sessions per Week">
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={data.weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="value"
                    name="Sessions"
                    fill="#8b5cf6"
                  />
                </BarChart>
              </ResponsiveContainer>

              <p className="dashboard-note">
                Total sessions per week over the last
                4 completed Monday–Sunday weeks.
              </p>
            </ChartPanel>
          </div>
        </>
      )}
    </div>
  );
}
