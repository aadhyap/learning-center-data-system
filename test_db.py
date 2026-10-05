#Python function → psycopg → PostgreSQL → tables → result back to Python

from db import (
    search_students,
    add_student,
    edit_student,
    check_in_student,
    get_students_today
)


# -------------------------
# TEST SEARCH
# -------------------------

def test_search_student():
    students = search_students("Ryan B")

    assert len(students) > 0
    assert students[0][2] == "Ryan"
    assert students[0][3] == "Brodski"

    print("✅ search_students passed")


# -------------------------
# TEST ADD STUDENT
# -------------------------

def test_add_student():
    student_id = add_student(
        "test01",
        "Test",
        "Student",
        "test@example.com",
        "CREATE",
        "White",
        "email",
        "Test student"
    )

    assert student_id is not None

    students = search_students("Test S")

    assert len(students) == 1
    assert students[0][0] == student_id
    assert students[0][2] == "Test"
    assert students[0][3] == "Student"

    print("✅ add_student passed")

    return student_id


# -------------------------
# TEST EDIT STUDENT
# -------------------------

def test_edit_student(student_id):

    edit_student(
        student_id,
        "test01",
        "Test",
        "Student",
        "test@example.com",
        "CREATE",
        "Yellow",
        "email",
        "Updated student"
    )

    students = search_students("Test S")

    assert students[0][4] == "CREATE"
    assert students[0][5] == "Yellow"

    print("✅ edit_student passed")


# -------------------------
# TEST CHECK IN
# -------------------------

def test_check_in(student_id):

    session_id = check_in_student(student_id)

    assert session_id is not None

    students_today = get_students_today()

    student_ids_today = [
        student[0]
        for student in students_today
    ]

    assert student_id in student_ids_today

    print("✅ check_in_student passed")


# -------------------------
# RUN TESTS
# -------------------------

test_search_student()

student_id = test_add_student()

test_edit_student(student_id)

test_check_in(student_id)

print("\n🎉 ALL TESTS PASSED")