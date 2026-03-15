# Import all models so SQLAlchemy picks them up during db.create_all()
from models.user import User
from models.student import Student
from models.instructor import Instructor
from models.course import Course
from models.reservation import Reservation
from models.payment import Payment
from models.enrollment import Enrollment

__all__ = [
    "User",
    "Student",
    "Instructor",
    "Course",
    "Reservation",
    "Payment",
    "Enrollment",
]
