#Python function → psycopg → PostgreSQL → tables → result back to Python

from db import search_students

results = search_students("Ryan B")

print(results)

