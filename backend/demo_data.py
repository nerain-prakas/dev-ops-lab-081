"""
Helper to check if the current request is from a demo account.
Works with flask-jwt-extended v4 where identity is a string (user_id).
"""
import os
from flask_jwt_extended import get_jwt_identity

# Demo user IDs (as strings, matching how auth.py stores them)
DEMO_USER_IDS = {"9001", "9002", "9003"}


def _demo_mode_enabled() -> bool:
    """
    Demo simulation is opt-in via DEMO_MODE_ENABLED=true.
    This avoids accidental fake writes in deployed environments.
    """
    raw = os.getenv("DEMO_MODE_ENABLED")
    if raw is None:
        return False
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def is_demo() -> bool:
    """Returns True if the current JWT belongs to a hardcoded demo account."""
    if not _demo_mode_enabled():
        return False
    try:
        return str(get_jwt_identity()) in DEMO_USER_IDS
    except Exception:
        return False


DEMO_COURSES = [
    {
        "course_id": 1,
        "instructor_id": 9002,
        "instructor_name": "Demo Instructor",
        "title": "Introduction to Python",
        "description": "Learn Python from scratch with hands-on projects.",
        "price": 4999.00,
        "total_seats": 30,
        "available_seats": 12,
    },
    {
        "course_id": 2,
        "instructor_id": 9002,
        "instructor_name": "Demo Instructor",
        "title": "Web Development with React",
        "description": "Build modern single-page apps using React and Vite.",
        "price": 6999.00,
        "total_seats": 25,
        "available_seats": 8,
    },
    {
        "course_id": 3,
        "instructor_id": 9002,
        "instructor_name": "Demo Instructor",
        "title": "Database Design & SQL",
        "description": "Relational database design, normalization, and advanced SQL.",
        "price": 3499.00,
        "total_seats": 40,
        "available_seats": 0,
    },
    {
        "course_id": 4,
        "instructor_id": 9002,
        "instructor_name": "Demo Instructor",
        "title": "Machine Learning Fundamentals",
        "description": "Supervised and unsupervised learning with scikit-learn.",
        "price": 8999.00,
        "total_seats": 20,
        "available_seats": 5,
    },
]

DEMO_ENROLLMENTS_STUDENT = [
    {"enrollment_id": 1, "student_id": 9003, "student_name": "Demo Student",
     "course_id": 1, "course_title": "Introduction to Python",
     "enrollment_date": "2025-03-01", "status": "active"},
    {"enrollment_id": 2, "student_id": 9003, "student_name": "Demo Student",
     "course_id": 2, "course_title": "Web Development with React",
     "enrollment_date": "2025-03-10", "status": "active"},
]

DEMO_ENROLLMENTS_INSTRUCTOR = [
    {"enrollment_id": 1, "student_id": 9003, "student_name": "Alice Johnson",
     "course_id": 1, "course_title": "Introduction to Python",
     "enrollment_date": "2025-03-01", "status": "active"},
    {"enrollment_id": 2, "student_id": 9004, "student_name": "Bob Smith",
     "course_id": 1, "course_title": "Introduction to Python",
     "enrollment_date": "2025-03-02", "status": "active"},
    {"enrollment_id": 3, "student_id": 9005, "student_name": "Carol White",
     "course_id": 2, "course_title": "Web Development with React",
     "enrollment_date": "2025-03-11", "status": "active"},
]

DEMO_ENROLLMENTS_ADMIN = DEMO_ENROLLMENTS_INSTRUCTOR + [
    {"enrollment_id": 4, "student_id": 9006, "student_name": "David Lee",
     "course_id": 3, "course_title": "Database Design & SQL",
     "enrollment_date": "2025-02-20", "status": "active"},
    {"enrollment_id": 5, "student_id": 9007, "student_name": "Eva Martinez",
     "course_id": 4, "course_title": "Machine Learning Fundamentals",
     "enrollment_date": "2025-03-05", "status": "active"},
]

DEMO_RESERVATIONS_STUDENT = [
    {"reservation_id": 1, "student_id": 9003, "student_name": "Demo Student",
     "course_id": 3, "course_title": "Database Design & SQL",
     "reservation_date": "2025-03-15", "status": "pending"},
]

DEMO_RESERVATIONS_ADMIN = [
    {"reservation_id": 1, "student_id": 9003, "student_name": "Demo Student",
     "course_id": 3, "course_title": "Database Design & SQL",
     "reservation_date": "2025-03-15", "status": "pending"},
    {"reservation_id": 2, "student_id": 9004, "student_name": "Bob Smith",
     "course_id": 4, "course_title": "Machine Learning Fundamentals",
     "reservation_date": "2025-03-12", "status": "confirmed"},
    {"reservation_id": 3, "student_id": 9005, "student_name": "Carol White",
     "course_id": 1, "course_title": "Introduction to Python",
     "reservation_date": "2025-03-08", "status": "cancelled"},
]

DEMO_PAYMENTS_STUDENT = [
    {"payment_id": 1, "reservation_id": 101, "amount": 4999.00,
     "payment_date": "2025-03-01", "payment_type": "credit_card"},
    {"payment_id": 2, "reservation_id": 102, "amount": 6999.00,
     "payment_date": "2025-03-10", "payment_type": "upi"},
]

DEMO_PAYMENTS_ADMIN = DEMO_PAYMENTS_STUDENT + [
    {"payment_id": 3, "reservation_id": 103, "amount": 8999.00,
     "payment_date": "2025-03-12", "payment_type": "credit_card"},
    {"payment_id": 4, "reservation_id": 104, "amount": 3499.00,
     "payment_date": "2025-02-20", "payment_type": "cash"},
]

DEMO_USERS_ADMIN = [
    {"user_id": 9001, "name": "Demo Admin",       "email": "admin@demo.com",      "role": "admin"},
    {"user_id": 9002, "name": "Demo Instructor",   "email": "instructor@demo.com", "role": "instructor"},
    {"user_id": 9003, "name": "Demo Student",      "email": "student@demo.com",    "role": "student"},
    {"user_id": 9004, "name": "Bob Smith",         "email": "bob@demo.com",        "role": "student"},
    {"user_id": 9005, "name": "Carol White",       "email": "carol@demo.com",      "role": "student"},
    {"user_id": 9006, "name": "David Lee",         "email": "david@demo.com",      "role": "student"},
    {"user_id": 9007, "name": "Eva Martinez",      "email": "eva@demo.com",        "role": "student"},
    {"user_id": 9008, "name": "Frank Chen",        "email": "frank@demo.com",      "role": "instructor"},
]

DEMO_DASHBOARD_SUMMARY = {
    "users":        {"total": 8, "students": 5, "instructors": 2, "admins": 1},
    "courses":      4,
    "reservations": {"total": 3, "pending": 1, "confirmed": 1, "cancelled": 1},
    "payments":     4,
    "enrollments":  6,
}


# Kept for backward compatibility with any old import
def is_demo_identity(identity: dict) -> bool:
    return str(identity.get("user_id", "")) in DEMO_USER_IDS
