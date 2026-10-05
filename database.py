import psycopg

# Connect to an existing database
#def get_connection():


def search_students(search):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
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