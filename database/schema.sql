CREATE TABLE students (
    username VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL, 
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    program VARCHAR(50),
    belt VARCHAR(50),
    debrief_method VARCHAR(20)
        CHECK (debrief_method IN ('in_person', 'email')),
    summary TEXT
);

CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL REFERENCES students(username),
    session_date TIMESTAMPTZ NOT NULL,
    next_session TEXT,
    achievements TEXT,
    notes TEXT
);