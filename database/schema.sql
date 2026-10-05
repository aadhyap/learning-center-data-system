CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50),
    program VARCHAR(50),
    belt VARCHAR(50)
);

CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    session_date TIMESTAMPTZ NOT NULL
    nextSession TEXT,
    achievements TEXT,
    notes TEXT,
);