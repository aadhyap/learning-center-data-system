from fastapi import FastAPI 
from db import search_students, add_student


app = FastAPI()


@app.get("/")
def root():
        return {"message" : "Student Progress API is running"}

@app.get("/students/search")
def search(name: str):
        students = search_students(name)
        return [
        {
            "student_id": student[0],
            "username": student[1],
            "first_name": student[2],
            "last_name": student[3],
            "program": student[4],
            "belt": student[5]
        }
        for student in students
    ]

