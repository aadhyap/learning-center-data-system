--Structure of Database
CREATE TABLE students (
    student_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL, 
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    program VARCHAR(50),
    belt VARCHAR(50),
    debrief_method VARCHAR(20)
        CHECK (debrief_method IN ('in person', 'email')),
    summary TEXT
);

CREATE TABLE sessions (
    session_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    session_date TIMESTAMPTZ NOT NULL,
    belt VARCHAR(50),
    next_session TEXT,
    achievements TEXT,
    notes TEXT,
    debrief_completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE tags (
    tag_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    session_id INTEGER REFERENCES sessions(session_id),
    tag_name VARCHAR(50) NOT NULL CHECK (
        tag_name IN (
            'coming_from_break',
            'needs_attention',
            'easily_distracted'
        )
    ),
    expires_at TIMESTAMPTZ
);