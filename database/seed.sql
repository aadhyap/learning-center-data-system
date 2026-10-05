--Making Students Table
INSERT INTO students
    (username, first_name, last_name, email, program, belt, debrief_method, summary)
VALUES
    ('ryan01', 'Ryan', 'Brodski', 'ryan@example.com', 'CREATE', 'Green', 'in_person', 'good student, sometimes asks for help for things too much just needs to be encouraged to do it on his own.'),
    ('hannah01', 'Hannah', 'Nguyen', 'hannah@example.com', 'CREATE', 'Bronze', 'email', 'works independently needs very little help, progresses fast');

--Making Session Data Table 
INSERT INTO sessions
    (student_id, session_date, next_session, achievements, notes)
VALUES
    (
        (SELECT student_id FROM students WHERE username = 'ryan01'),
        '2026-09-28 14:00:00-07',
        'Continue Block Jumper',
        'Created collision blocks',
        'Worked on understanding how to place blocks underneath the player.'
    ),
    (
        (SELECT student_id FROM students WHERE username = 'ryan01'),
        '2026-10-04 15:00:00-07',
        'Finish Block Jumper',
        'Worked independently',
        'Made progress on the wall mechanics.'
    ),
    (
        (SELECT student_id FROM students WHERE username = 'hannah01'),
        '2026-10-04 16:00:00-07',
        'Continue Labyrinth',
        'Finished Cyber Fu',
        'Started building the 3D maze assets.'
    );

/*

Results 

Ryan
 ├── Sep 28 session
 └── Oct 4 session

Hannah
 └── Oct 4 session

Tyler
 └── no sessions yet

Questions
-- What is a stundent's history?

-- Who came in today?

-- Who came in on October 4?

-- When did each student last come in?

-- How many sessions has each student had?

*/