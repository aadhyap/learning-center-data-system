from fastapi import FastAPI 
from db import search_students


app = FastAPI()


@app.get("/")
def root():
        return {"message" : "Student Progress API is running"}

@app.get("/students/search")
def search(name: str):
        students = search_students(name)
        return students

