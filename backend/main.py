
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from auth import require_auth
from datetime import datetime, time
from zoneinfo import ZoneInfo
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query


from db import (
    search_students,
    add_student,
    edit_student,
    check_in_student,
    get_students_today,
    get_student_history,
    get_all_students,
    edit_session,
    edit_student_belt,
    delete_session,
    get_active_student_tags,
    add_student_tag,
    expire_tag,
    finalize_day,
)


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://main.d2wby0thnd3t0f.amplifyapp.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Authentication
# All endpoints registered on this router
# require Google authentication.
# --------------------------------------------------

protected = APIRouter(
    dependencies=[Depends(require_auth)]
)


# --------------------------------------------------
# Scheduler
# --------------------------------------------------

PACIFIC = ZoneInfo("America/Los_Angeles")

scheduler = BackgroundScheduler(
    timezone="America/Los_Angeles"
)

scheduler.add_job(
    finalize_day,
    trigger="cron",
    hour=18,
    minute=0,
    id="finalize_day",
    replace_existing=True,
)

scheduler.start()


# --------------------------------------------------
# Pydantic models
# --------------------------------------------------

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    email: str | None = None
    program: str | None = None
    belt: str | None = None
    debrief_method: str | None = None
    summary: str | None = None


class StudentUpdate(BaseModel):
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


class TagCreate(BaseModel):
    tag_name: str


class BeltUpdate(BaseModel):
    belt: str


# --------------------------------------------------
# Public health check
# AWS can access this without Google authentication.
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Student Progress API is running"
    }


# --------------------------------------------------
# Search students
# --------------------------------------------------

@protected.get("/students/search")
def search(name: str):
    students = search_students(name)

    return [
        {
            "student_id": student[0],
            "first_name": student[1],
            "last_name": student[2],
            "program": student[3],
            "belt": student[4],
        }
        for student in students
    ]


# --------------------------------------------------
# Add student
# --------------------------------------------------

@protected.post("/students")
def create_student(student: StudentCreate):
    student_id = add_student(
        student.first_name,
        student.last_name,
        student.email,
        student.program,
        student.belt,
        student.debrief_method,
        student.summary,
    )

    return {"student_id": student_id}


# --------------------------------------------------
# Check in student
# --------------------------------------------------

@protected.post("/students/{student_id}/check-in")
def check_in(student_id: int):
    session_id = check_in_student(student_id)

    if session_id is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return {"session_id": session_id}


# --------------------------------------------------
# Create student tag
# --------------------------------------------------

@protected.post("/students/{student_id}/tags")
def create_student_tag(student_id: int, tag: TagCreate):
    tag_id = add_student_tag(
        student_id,
        tag.tag_name,
    )

    return {
        "tag_id": tag_id,
        "student_id": student_id,
        "tag_name": tag.tag_name,
    }


# --------------------------------------------------
# Get active student tags
# --------------------------------------------------

@protected.get("/students/{student_id}/tags")
def student_active_tags(student_id: int):
    return get_active_student_tags(student_id)


# --------------------------------------------------
# Expire student tag
# --------------------------------------------------

@protected.patch("/tags/{tag_id}/expire")
def expire_student_tag(tag_id: int):
    expired_id = expire_tag(tag_id)

    if expired_id is None:
        raise HTTPException(
            status_code=404,
            detail="Tag not found or already expired",
        )

    return {
        "tag_id": expired_id,
        "expired": True,
    }


# --------------------------------------------------
# Update student
# --------------------------------------------------

@protected.put("/students/{student_id}")
def update_student(student_id: int, student: StudentUpdate):
    edit_student(
        student_id,
        student.first_name,
        student.last_name,
        student.email,
        student.program,
        student.belt,
        student.debrief_method,
        student.summary,
    )

    return {"message": "Student updated"}


# --------------------------------------------------
# Update session
# --------------------------------------------------

@protected.put("/sessions/{session_id}")
def update_session(session_id: int, session: SessionUpdate):
    edit_session(
        session_id,
        session.next_session,
        session.achievements,
        session.notes,
        session.debrief_completed,
    )

    return {"message": "Session updated"}


# --------------------------------------------------
# Get all students
# --------------------------------------------------



@protected.get("/students")
def all_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: str = "",
    program: str = "all",
    belt_color: str = "all",
    track: str = "all",
    rank: str = "all",
    robotics_level: str = "all",
    attendance: str = "all",
    sort_by: str = "name",
):
    return get_all_students(
        page=page,
        page_size=page_size,
        search=search,
        program=program,
        belt_color=belt_color,
        track=track,
        rank=rank,
        robotics_level=robotics_level,
        attendance=attendance,
        sort_by=sort_by,
    )



# --------------------------------------------------
# Get student history
# --------------------------------------------------

@protected.get("/students/{student_id}/history")
def student_history(student_id: int):
    return get_student_history(student_id)


# --------------------------------------------------
# Get today's students
# --------------------------------------------------

@protected.get("/students/today")
def students_today():
    students = get_students_today()

    return [
        {
            "student_id": student[0],
            "first_name": student[1],
            "last_name": student[2],
            "program": student[3],
            "debrief_method": student[4],
            "email": student[5],
            "belt": student[6],
            "session_id": student[7],
            "session_date": student[8],
            "next_session": student[9],
            "achievements": student[10],
            "notes": student[11],
            "debrief_completed": student[12],
        }
        for student in students
    ]


# --------------------------------------------------
# Delete session
# --------------------------------------------------

@protected.delete("/sessions/{session_id}")
def remove_session(session_id: int):
    delete_session(session_id)

    return {"message": "Session deleted"}


# --------------------------------------------------
# Update student belt
# --------------------------------------------------

@protected.patch("/students/{student_id}/belt")
def update_student_belt(student_id: int, data: BeltUpdate):
    updated = edit_student_belt(
        student_id,
        data.belt,
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    return {
        "student_id": student_id,
        "belt": data.belt,
    }


# --------------------------------------------------
# Manually finalize today's sessions
# Only available between 5:50 PM and 6:00 PM Pacific.
# --------------------------------------------------

@protected.post("/sessions/finalize-day")
def finalize_today():
    now = datetime.now(PACIFIC)

    if not (time(17, 50) <= now.time() < time(18, 0)):
        raise HTTPException(
            status_code=403,
            detail=(
                "Save Day is only available from "
                "5:50 PM to 6:00 PM Pacific."
            ),
        )

    count = finalize_day()

    return {
        "message": "Day finalized successfully",
        "sessions_finalized": count,
    }


app.include_router(protected)
