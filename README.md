# Student Progress System

**A prototype data system for learning centers that transforms fragmented daily progress records into structured, searchable student histories.**

The system organizes student information and session records so instructors can quickly retrieve a student's history, 
understand their progress, and find students using useful filters.

## Problem

Student progress is recorded across daily documents and spreadsheets. While this works for day-to-day operations, historical information becomes difficult to retrieve and instructors may have to manually search through previous records.

This project explores a more structured approach to storing and retrieving student progress data.

## Core Features

- **Student Profiles** — Store student information, current program, belt level, and parent email etc.
- **Session History** — Each student visit creates a session containing their progress notes. Previous sessions remain available as historical records.
- **Search** — Find students directly using identifiers or other searchable information.
- **Programs** — Organize and filter students by programs such as CREATE, Junior, Robotics, or AI.
- **Tags** — Apply operational labels such as `Needs Attention` or `Returning From Break`.
- **Attendance History** — Retrieve students who attended on a particular day.
- **Current Students** — View students who are checked in for the current day and their current progress notes.

## Data Relationships

The core relationship is:

Student → Sessions → History

A **student** can have many **sessions**.

Each session represents a visit to the learning center and contains the student's progress notes for that day. Sessions are preserved so instructors can view a student's history from newest to oldest.

Students can also be categorized using **programs** and **tags**, allowing instructors to filter and retrieve students based on operational needs.

<img width="566" height="696" alt="Screenshot 2026-10-05 at 11 31 25 AM" src="https://github.com/user-attachments/assets/6bc15f76-513b-419f-a4a9-ba8569ab3378" />

## Example Queries

The system is designed to answer questions such as:

- What is this student's session history?
- Which students attended on a specific day?
- Which students are currently checked in?
- Which students are enrolled in a particular program?
- Which students are tagged as `Needs Attention`?
- When was a student's most recent session?


