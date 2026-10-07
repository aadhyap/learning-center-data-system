import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
# Connect to an existing database
def get_connection():
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
                    session_id,
                    student_id,
                    session_date,
                    next_session,
                    achievements,
                    notes,
                    debrief_completed
                FROM sessions
                WHERE student_id = %s
                ORDER BY session_date DESC;
            """, (student_id,))

            return cur.fetchall()

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
            cur.execute("""
                INSERT INTO sessions (
                    student_id,
                    session_date
                )
                VALUES (%s, NOW())
                RETURNING session_id;
            """, (student_id,))

            session_id = cur.fetchone()[0]

    return session_id

def get_all_students():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    student_id,
                    username,
                    first_name,
                    last_name,
                    email,
                    program,
                    belt,
                    debrief_method,
                    summary
                FROM students
                ORDER BY first_name, last_name
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
                    students.belt,
                    sessions.session_id,
                    sessions.session_date
                FROM sessions
                JOIN students
                    ON sessions.student_id = students.student_id
                WHERE sessions.session_date::date = CURRENT_DATE
                ORDER BY sessions.session_date;
            """)

            return cur.fetchall()