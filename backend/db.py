import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
# Connect to an existing database
def get_connection():
    print("DB_HOST:", os.getenv("DB_HOST"))
    print("DB_NAME:", os.getenv("DB_NAME"))

    return psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


def search_students(search):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    student_id,
                    username,
                    first_name,
                    last_name,
                    program,
                    belt
                FROM students
                WHERE (first_name || ' ' || last_name) ILIKE %s
                ORDER BY first_name, last_name;
            """, (search + "%",))

            return cur.fetchall()

'''
Get all sessions for one student, newest first
'''

def get_student_history(student_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    sessions.session_id,
                    sessions.student_id,
                    sessions.session_date,
                    sessions.next_session,
                    sessions.achievements,
                    sessions.notes,
                    sessions.debrief_completed,

                    COALESCE(
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'tag_id', tags.tag_id,
                                    'tag_name', tags.tag_name,
                                    'expires_at', tags.expires_at
                                )
                                ORDER BY tags.tag_id
                            )
                            FROM tags
                            WHERE tags.session_id = sessions.session_id
                              AND tags.student_id = sessions.student_id
                        ),
                        '[]'::json
                    ) AS tags

                FROM sessions
                WHERE sessions.student_id = %s
                ORDER BY sessions.session_date DESC
            """, (student_id,))

            columns = [desc[0] for desc in cur.description]

            return [
                dict(zip(columns, row))
                for row in cur.fetchall()
            ]

'''

Add Student

'''
def add_student(
    username,
    first_name,
    last_name,
    email,
    program,
    belt,
    debrief_method,
    summary
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO students (
                    username,
                    first_name,
                    last_name,
                    email,
                    program,
                    belt,
                    debrief_method,
                    summary
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING student_id;
            """, (
                username,
                first_name,
                last_name,
                email,
                program,
                belt,
                debrief_method,
                summary
            ))

            student_id = cur.fetchone()[0]

    return student_id

'''
Add session tags
'''
def add_student_tag(student_id, tag_name):
    with get_connection() as conn:
        with conn.cursor() as cur:

            # Find the student's latest session today
            cur.execute("""
                SELECT session_id, session_date
                FROM sessions
                WHERE student_id = %s
                  AND session_date::date = CURRENT_DATE
                ORDER BY session_date DESC
                LIMIT 1
            """, (student_id,))

            session = cur.fetchone()

            session_id = session[0] if session else None
            session_date = session[1] if session else None

            # Coming from Break expires at midnight
            # after the session day.
            expires_at = None

            if tag_name == "coming_from_break" and session_date:
                from datetime import timedelta
                expires_at = (
                    session_date.date() + timedelta(days=1)
                )

            cur.execute("""
                INSERT INTO tags (
                    student_id,
                    session_id,
                    tag_name,
                    expires_at
                )
                VALUES (%s, %s, %s, %s)
                RETURNING tag_id
            """, (student_id, session_id, tag_name, expires_at))

            return cur.fetchone()[0]

'''
Can Edit Student, can change any of its parameters 
'''
def edit_student(
    student_id,
    username,
    first_name,
    last_name,
    email,
    program,
    belt,
    debrief_method,
    summary
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE students
                SET
                    username = %s,
                    first_name = %s,
                    last_name = %s,
                    email = %s,
                    program = %s,
                    belt = %s,
                    debrief_method = %s,
                    summary = %s
                WHERE student_id = %s;
            """, (
                username,
                first_name,
                last_name,
                email,
                program,
                belt,
                debrief_method,
                summary,
                student_id
            ))

'''
Can Edit Student Session
'''
def edit_session(
    session_id,
    next_session,
    achievements,
    notes,
    debrief_completed
):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE sessions
                SET
                    next_session = %s,
                    achievements = %s,
                    notes = %s,
                    debrief_completed = %s
                WHERE session_id = %s;
            """, (
                next_session,
                achievements,
                notes,
                debrief_completed,
                session_id
            ))
'''
Can Check In Student by student_id, create a new session  
'''
def check_in_student(student_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO sessions (
                    student_id,
                    session_date,
                    belt,
                    notes
                )
                SELECT
                    students.student_id,
                    NOW(),
                    students.belt,
                     (
                        SELECT previous.next_session
                        FROM sessions AS previous
                        WHERE previous.student_id = students.student_id
                          AND previous.session_date < CURRENT_DATE
                        ORDER BY previous.session_date DESC,
                                 previous.session_id DESC
                        LIMIT 1
                    )
                FROM students
                WHERE students.student_id = %s
                RETURNING session_id
                """,
                (student_id,)
            )

            result = cur.fetchone()

            if result:
                session_id = result[0]

                # Link pending tags to the new session
                cur.execute("""
                    UPDATE tags
                    SET
                        session_id = %s,
                        expires_at = CASE
                            WHEN tag_name = 'coming_from_break'
                            THEN date_trunc('day', NOW()) + INTERVAL '1 day'
                            ELSE NULL
                        END
                    WHERE student_id = %s
                    AND session_id IS NULL
                    AND expires_at IS NULL
                """, (session_id, student_id))

                return session_id

            return None

def get_all_students():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    students.student_id,
                    students.username,
                    students.first_name,
                    students.last_name,
                    students.email,
                    students.program,
                    students.belt,
                    students.debrief_method,
                    students.summary,
                    MAX(sessions.session_date) AS last_session
                FROM students
                LEFT JOIN sessions
                    ON students.student_id = sessions.student_id
                GROUP BY students.student_id
                ORDER BY students.first_name, students.last_name
            """)

            columns = [desc[0] for desc in cur.description]

            return [
                dict(zip(columns, row))
                for row in cur.fetchall()
            ]
'''
Get all the students that came in Today
'''

def get_students_today():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    students.student_id,
                    students.first_name,
                    students.last_name,
                    students.program,
                    students.debrief_method,
                    students.email,
                    sessions.belt,
                    sessions.session_id,
                    sessions.session_date,
                    sessions.next_session,
                    sessions.achievements,
                    sessions.notes,
                    sessions.debrief_completed
                FROM students
                JOIN sessions
                    ON students.student_id = sessions.student_id
                WHERE sessions.session_date::date = CURRENT_DATE
                ORDER BY sessions.session_date
            """)

            return cur.fetchall()

'''get active tags'''

def get_active_student_tags(student_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    tag_id,
                    student_id,
                    session_id,
                    tag_name,
                    expires_at
                FROM tags
                WHERE student_id = %s
                  AND (
                      expires_at IS NULL
                      OR expires_at > NOW()
                  )
                ORDER BY tag_id DESC
            """, (student_id,))

            columns = [desc[0] for desc in cur.description]
            return [
                dict(zip(columns, row))
                for row in cur.fetchall()
            ]


''' Delete '''
def delete_session(session_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM sessions
                WHERE session_id = %s
                """,
                (session_id,)
            )



def expire_tag(tag_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT session_id
                FROM tags
                WHERE tag_id = %s
                  AND (expires_at IS NULL OR expires_at > NOW())
                FOR UPDATE
            """, (tag_id,))

            result = cur.fetchone()

            if result is None:
                return None

            session_id = result[0]

            if session_id is None:
                cur.execute("""
                    DELETE FROM tags
                    WHERE tag_id = %s
                """, (tag_id,))
            else:
                cur.execute("""
                    UPDATE tags
                    SET expires_at = NOW()
                    WHERE tag_id = %s
                """, (tag_id,))

            return tag_id


