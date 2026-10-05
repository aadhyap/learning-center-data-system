--Making Students Table
INSERT INTO students
    (username, first_name, last_name, email, program, belt)
VALUES
    ('ryan01', 'Ryan', 'Brodski', 'ryan@example.com', 'CREATE', 'Green'),
    ('hannah01', 'Hannah', 'Nguyen', 'hannah@example.com', 'CREATE', 'Bronze'),

--Making Session Data Table 
INSERT INTO sessions
    (username, session_date, next_session, achievements, notes)
VALUES
    (
        'ryan01',
        '2026-09-28 14:00:00-07',
        'Continue Block Jumper',
        'Created collision blocks',
        'Worked on understanding how to place blocks underneath the player.'
    ),
    (
        'ryan01',
        '2026-10-04 15:00:00-07',
        'Finish Block Jumper',
        'Worked independently',
        'Made progress on the wall mechanics.'
    ),
    (
        'hannah01',
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