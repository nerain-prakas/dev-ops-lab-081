from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.reservations import reservations_bp
from routes.payments import payments_bp
from routes.enrollments import enrollments_bp
from routes.admin import admin_bp

__all__ = [
    "auth_bp",
    "courses_bp",
    "reservations_bp",
    "payments_bp",
    "enrollments_bp",
    "admin_bp",
]
