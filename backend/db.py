import os
import time
from contextlib import contextmanager
from threading import Lock

import psycopg
from psycopg.conninfo import make_conninfo
from psycopg_pool import ConnectionPool
from dotenv import load_dotenv

load_dotenv()

# One pool per backend process. Connections are opened lazily and reused.
_pool = None
_pool_lock = Lock()


def _get_pool():
    global _pool
    if _pool is None:
        with _pool_lock:
            if _pool is None:
                conninfo = make_conninfo(
                    "",
                    host=os.getenv("DB_HOST"),
                    port=os.getenv("DB_PORT"),
                    dbname=os.getenv("DB_NAME"),
                    user=os.getenv("DB_USER"),
                    password=os.getenv("DB_PASSWORD"),
                )
                _pool = ConnectionPool(
                    conninfo=conninfo,
                    min_size=1,
                    max_size=5,
                    timeout=15,
                    open=True,
                )
    return _pool


@contextmanager
def get_connection():
    # Automatically commits/rolls back and returns connection to pool.
    with _get_pool().connection() as conn:
        yield conn


def search_students(search):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    student_id,
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
                    first_name,
                    last_name,
                    email,
                    program,
                    belt,
                    debrief_method,
                    summary
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING student_id;
            """, (
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
                    first_name = %s,
                    last_name = %s,
                    email = %s,
                    program = %s,
                    belt = %s,
                    debrief_method = %s,
                    summary = %s
                WHERE student_id = %s;
            """, (
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
Setting Debrief
'''
def update_session_debrief(session_id, debrief_completed):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE sessions
                SET debrief_completed = %s
                WHERE session_id = %s
                  AND finalized = FALSE
                RETURNING session_id, debrief_completed;
            """, (debrief_completed, session_id))

            result = cur.fetchone()

            if result is None:
                return None

            return {
                "session_id": result[0],
                "debrief_completed": result[1]
            }

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



def get_all_students(
    page=1,
    page_size=25,
    search="",
    program="all",
    belt_color="all",
    track="all",
    rank="all",
    robotics_level="all",
    attendance="all",
    sort_by="name",
):
    offset = (page - 1) * page_size

    conditions = []
    params = []

    if search.strip():
        conditions.append(
            "(s.first_name || ' ' || s.last_name) ILIKE %s"
        )
        params.append(f"%{search.strip()}%")

    if program != "all":
        conditions.append("LOWER(s.program) = LOWER(%s)")
        params.append(program)

    if belt_color != "all":
        conditions.append(
            "LOWER(SPLIT_PART(s.belt, '_', 1)) = LOWER(%s)"
        )
        params.append(belt_color)

    if track != "all":
        conditions.append(
            "LOWER(SPLIT_PART(s.belt, '_', 1)) = LOWER(%s)"
        )
        params.append(track)

    if rank != "all":
        conditions.append(
            "LOWER(SPLIT_PART(s.belt, '_', 2)) = LOWER(%s)"
        )
        params.append(rank)

    if robotics_level != "all":
        conditions.append("s.belt ILIKE %s")
        params.append(f"%{robotics_level}%")

    if attendance == "never":
        conditions.append("latest.last_session IS NULL")
    elif attendance == "attended":
        conditions.append("latest.last_session IS NOT NULL")

    where_clause = (
        "WHERE " + " AND ".join(conditions)
        if conditions else ""
    )

    if sort_by == "recent":
        order_clause = (
            "ORDER BY latest.last_session DESC NULLS LAST, "
            "s.student_id"
        )
    elif sort_by == "oldest":
        order_clause = (
            "ORDER BY latest.last_session ASC NULLS LAST, "
            "s.student_id"
        )
    else:
        order_clause = (
            "ORDER BY s.first_name, s.last_name, s.student_id"
        )

    base_query = f"""
        FROM students s
        LEFT JOIN LATERAL (
            SELECT MAX(session_date) AS last_session
            FROM sessions
            WHERE student_id = s.student_id
        ) latest ON TRUE
        {where_clause}
    """

    connection_start = time.perf_counter()
    with get_connection() as conn:
        print(f"DB connection checkout: {time.perf_counter() - connection_start:.3f}s", flush=True)
        with conn.cursor() as cur:
            count_start = time.perf_counter()
            cur.execute(
                f"SELECT COUNT(*) {base_query}",
                tuple(params)
            )
            total = cur.fetchone()[0]
            print(f"COUNT query: {time.perf_counter() - count_start:.3f}s", flush=True)

            select_start = time.perf_counter()
            cur.execute(
                f"""
                SELECT
                    s.student_id,
                    s.first_name,
                    s.last_name,
                    s.email,
                    s.program,
                    s.belt,
                    s.debrief_method,
                    s.summary,
                    latest.last_session
                {base_query}
                {order_clause}
                LIMIT %s OFFSET %s
                """,
                tuple(params + [page_size, offset])
            )
            columns = [desc[0] for desc in cur.description]
            students = [
                dict(zip(columns, row))
                for row in cur.fetchall()
            ]
            print(f"SELECT query: {time.perf_counter() - select_start:.3f}s", flush=True)

    return {
        "students": students,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }

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
                    students.belt,
                    sessions.session_id,
                    sessions.session_date,
                    sessions.next_session,
                    sessions.achievements,
                    sessions.notes,
                    sessions.debrief_completed
                FROM students
                JOIN sessions
                    ON students.student_id = sessions.student_id
                WHERE
                    (sessions.session_date AT TIME ZONE 'America/Los_Angeles')::date =
                    (NOW() AT TIME ZONE 'America/Los_Angeles')::date
                    AND sessions.finalized = FALSE
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

def edit_student_belt(student_id, belt):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE students
                SET belt = %s
                WHERE student_id = %s
                RETURNING student_id
                """,
                (belt, student_id)
            )
            updated = cur.fetchone()
            return updated is not None

def finalize_day():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE sessions
                SET finalized = TRUE
                WHERE finalized = FALSE
                  AND (
                    session_date AT TIME ZONE
                    'America/Los_Angeles'
                  )::date <= (
                    NOW() AT TIME ZONE
                    'America/Los_Angeles'
                  )::date
                RETURNING session_id
            """)

            return len(cur.fetchall())