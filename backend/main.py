from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from db import (
    search_students,
    add_student,
    edit_student,
    check_in_student,
    get_students_today,
    get_student_history,
    get_all_students,
    edit_session,
    delete_session
)

app = FastAPI()
#to let FastAPI let the React app running at localhost:5173 to make browser requests to me
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str | None = None
    program: str | None = None
    belt: str | None = None
    debrief_method: str | None = None
    summary: str | None = None

class StudentUpdate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str | None = None
    program: str | None = None
    belt: str | None = None
    debrief_method: str | None = None
    summary: str | None = None

class SessionUpdate(BaseModel):
    next_session: str | None = None
    achievements: str | None = None
    notes: str | None = None
    debrief_completed: bool = False

@app.get("/")
def root():
        return {"message" : "Student Progress API is running"}

#Searches Student
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

#Add Student
@app.post("/students")
def create_student(student: StudentCreate):

    student_id = add_student(
        student.username,
        student.first_name,
        student.last_name,
        student.email,
        student.program,
        student.belt,
        student.debrief_method,
        student.summary
    )

    return {
        "student_id": student_id
    }

#Add session for student
@app.post("/students/{student_id}/check-in")
def check_in(student_id: int):

    session_id = check_in_student(student_id)

    return {
        "session_id": session_id
    }

#Update Student 
@app.put("/students/{student_id}")
def update_student(student_id: int, student: StudentUpdate):

    edit_student(
        student_id,
        student.username,
        student.first_name,
        student.last_name,
        student.email,
        student.program,
        student.belt,
        student.debrief_method,
        student.summary
    )

    return {
        "message": "Student updated"
    }

#Update Session
@app.put("/sessions/{session_id}")
def update_session(session_id: int, session: SessionUpdate):

    edit_session(
        session_id,
        session.next_session,
        session.achievements,
        session.notes,
        session.debrief_completed
    )

    return {
        "message": "Session updated"
    }

# Get all students
@app.get("/students")
def all_students():
    return get_all_students()


#Get Students history
@app.get("/students/{student_id}/history")
def student_history(student_id: int):

    sessions = get_student_history(student_id)

    return [
        {
            "session_id": session[0],
            "student_id": session[1],
            "session_date": session[2],
            "next_session": session[3],
            "achievements": session[4],
            "notes": session[5],
            "debrief_completed": session[6]
        }
        for session in sessions
    ]

#Get Students Today
@app.get("/students/today")
def students_today():
    students = get_students_today()

    return [
        {
            "student_id": student[0],
            "first_name": student[1],
            "last_name": student[2],
            "program": student[3],
            "belt": student[4],
            "session_id": student[5],
            "session_date": student[6],
            "next_session": student[7],
            "achievements": student[8],
            "notes": student[9],
            "debrief_completed": student[10]
        }
        for student in students
    ]

''' Delete '''
@app.delete("/sessions/{session_id}")
def remove_session(session_id: int):
    delete_session(session_id)
    return {"message": "Session deleted"}