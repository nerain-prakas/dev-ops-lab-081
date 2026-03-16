from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from models.student import Student
from models.instructor import Instructor
from models.course import Course
from models.reservation import Reservation
from models.payment import Payment
from models.enrollment import Enrollment
from flask_jwt_extended import get_jwt_identity
from utils.decorators import admin_required
from demo_data import (
    DEMO_USERS_ADMIN, DEMO_COURSES, DEMO_ENROLLMENTS_ADMIN,
    DEMO_RESERVATIONS_ADMIN, DEMO_PAYMENTS_ADMIN,
    DEMO_DASHBOARD_SUMMARY, is_demo_identity
)

admin_bp = Blueprint("admin", __name__)


def _is_demo(fn):
    """Helper: returns True if the current JWT is a demo account."""
    return is_demo_identity(get_jwt_identity())


# ─────────────────────────────────────────────
# Dashboard
# ─────────────────────────────────────────────
@admin_bp.route("/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    if _is_demo():
        return jsonify({"summary": DEMO_DASHBOARD_SUMMARY}), 200
    try:
        return jsonify({"summary": {
            "users": {
                "total":       User.query.count(),
                "students":    Student.query.count(),
                "instructors": Instructor.query.count(),
                "admins":      User.query.filter_by(role="admin").count(),
            },
            "courses":      Course.query.count(),
            "reservations": {
                "total":     Reservation.query.count(),
                "pending":   Reservation.query.filter_by(status="pending").count(),
                "confirmed": Reservation.query.filter_by(status="confirmed").count(),
                "cancelled": Reservation.query.filter_by(status="cancelled").count(),
            },
            "payments":    Payment.query.count(),
            "enrollments": Enrollment.query.count(),
        }}), 200
    except Exception:
        return jsonify({"summary": DEMO_DASHBOARD_SUMMARY}), 200


# ─────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────
@admin_bp.route("/admin/users", methods=["GET"])
@admin_required
def get_all_users():
    if _is_demo():
        role_filter = request.args.get("role")
        users = [u for u in DEMO_USERS_ADMIN if not role_filter or u["role"] == role_filter]
        return jsonify({"total": len(users), "users": users}), 200
    try:
        role_filter = request.args.get("role")
        query = User.query
        if role_filter:
            query = query.filter_by(role=role_filter.lower())
        users = query.all()
        return jsonify({"total": len(users), "users": [u.to_dict() for u in users]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_USERS_ADMIN), "users": DEMO_USERS_ADMIN}), 200


@admin_bp.route("/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    if _is_demo():
        user = next((u for u in DEMO_USERS_ADMIN if u["user_id"] == user_id), None)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user}), 200
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user.to_dict()}), 200
    except Exception:
        return jsonify({"error": "DB unavailable"}), 503


@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    if _is_demo():
        return jsonify({"message": "Demo mode: user deletion simulated!"}), 200
    try:
        identity = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        if user.user_id == identity["user_id"]:
            return jsonify({"error": "You cannot delete your own account"}), 400
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User '{user.email}' deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/admin/users/<int:user_id>/role", methods=["PATCH"])
@admin_required
def change_user_role(user_id):
    if _is_demo():
        data = request.get_json() or {}
        return jsonify({"message": f"Demo mode: role changed to '{data.get('role')}'!"}), 200
    try:
        data = request.get_json() or {}
        new_role = data.get("role", "").lower()
        if new_role not in ("student", "instructor", "admin"):
            return jsonify({"error": "Invalid role"}), 400
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.role = new_role
        db.session.commit()
        return jsonify({"message": f"Role updated to '{new_role}'", "user": user.to_dict()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Courses
# ─────────────────────────────────────────────
@admin_bp.route("/admin/courses", methods=["GET"])
@admin_required
def get_all_courses():
    if _is_demo():
        return jsonify({"total": len(DEMO_COURSES), "courses": DEMO_COURSES}), 200
    try:
        courses = Course.query.all()
        return jsonify({"total": len(courses), "courses": [c.to_dict() for c in courses]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_COURSES), "courses": DEMO_COURSES}), 200


@admin_bp.route("/admin/courses/<int:course_id>", methods=["DELETE"])
@admin_required
def delete_course(course_id):
    if _is_demo():
        return jsonify({"message": "Demo mode: course deleted!"}), 200
    try:
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"error": "Course not found"}), 404
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": f"Course '{course.title}' deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Reservations
# ─────────────────────────────────────────────
@admin_bp.route("/admin/reservations", methods=["GET"])
@admin_required
def get_all_reservations():
    if _is_demo():
        status = request.args.get("status")
        data   = [r for r in DEMO_RESERVATIONS_ADMIN if not status or r["status"] == status]
        return jsonify({"total": len(data), "reservations": data}), 200
    try:
        status = request.args.get("status")
        query  = Reservation.query
        if status:
            query = query.filter_by(status=status.lower())
        reservations = query.all()
        return jsonify({"total": len(reservations), "reservations": [r.to_dict() for r in reservations]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_RESERVATIONS_ADMIN), "reservations": DEMO_RESERVATIONS_ADMIN}), 200


@admin_bp.route("/admin/reservations/<int:reservation_id>", methods=["PATCH"])
@admin_required
def update_reservation_status(reservation_id):
    if _is_demo():
        data = request.get_json() or {}
        return jsonify({"message": f"Demo mode: status changed to '{data.get('status')}'!"}), 200
    try:
        data       = request.get_json() or {}
        new_status = data.get("status", "").lower()
        if new_status not in ("pending", "confirmed", "cancelled"):
            return jsonify({"error": "Invalid status"}), 400
        reservation = Reservation.query.get(reservation_id)
        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404
        if new_status == "confirmed":
            reservation.confirm()
        elif new_status == "cancelled":
            reservation.cancel()
            reservation.course.release_seat()
        else:
            reservation.status = new_status
        db.session.commit()
        return jsonify({"message": f"Status updated to '{new_status}'", "reservation": reservation.to_dict()}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────
@admin_bp.route("/admin/payments", methods=["GET"])
@admin_required
def get_all_payments():
    if _is_demo():
        return jsonify({"total": len(DEMO_PAYMENTS_ADMIN), "payments": DEMO_PAYMENTS_ADMIN}), 200
    try:
        payments = Payment.query.all()
        return jsonify({"total": len(payments), "payments": [p.to_dict() for p in payments]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_PAYMENTS_ADMIN), "payments": DEMO_PAYMENTS_ADMIN}), 200


# ─────────────────────────────────────────────
# Enrollments
# ─────────────────────────────────────────────
@admin_bp.route("/admin/enrollments", methods=["GET"])
@admin_required
def get_all_enrollments():
    if _is_demo():
        return jsonify({"total": len(DEMO_ENROLLMENTS_ADMIN), "enrollments": DEMO_ENROLLMENTS_ADMIN}), 200
    try:
        enrollments = Enrollment.query.all()
        return jsonify({"total": len(enrollments), "enrollments": [e.to_dict() for e in enrollments]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_ENROLLMENTS_ADMIN), "enrollments": DEMO_ENROLLMENTS_ADMIN}), 200
