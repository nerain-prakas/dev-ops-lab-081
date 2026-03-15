from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from models.student import Student
from models.instructor import Instructor
from models.course import Course
from models.reservation import Reservation
from models.payment import Payment
from models.enrollment import Enrollment
from flask_jwt_extended import jwt_required, get_jwt_identity
from functools import wraps

admin_bp = Blueprint("admin", __name__)


# ─────────────────────────────────────────────
# Helper: Admin-only decorator
# ─────────────────────────────────────────────
def admin_required(fn):
    """Decorator that restricts an endpoint to admin users only."""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        identity = get_jwt_identity()
        if identity.get("role") != "admin":
            return jsonify({"error": "Access denied: Admins only"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ─────────────────────────────────────────────
# Users
# ─────────────────────────────────────────────
@admin_bp.route("/admin/users", methods=["GET"])
@admin_required
def get_all_users():
    """GET /admin/users — List all registered users with optional role filter."""
    role = request.args.get("role")  # ?role=student|instructor|admin
    query = User.query
    if role:
        query = query.filter_by(role=role.lower())
    users = query.all()
    return jsonify({
        "total": len(users),
        "users": [u.to_dict() for u in users]
    }), 200


@admin_bp.route("/admin/users/<int:user_id>", methods=["GET"])
@admin_required
def get_user(user_id):
    """GET /admin/users/<id> — Get details of a specific user."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = user.to_dict()
    # Enrich with profile details
    if user.role == "student" and user.student:
        data["phone"] = user.student.phone
    elif user.role == "instructor" and user.instructor:
        data["specialization"] = user.instructor.specialization
    return jsonify({"user": data}), 200


@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    """DELETE /admin/users/<id> — Delete a user (cascades to profile)."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    identity = get_jwt_identity()
    if user.user_id == identity["user_id"]:
        return jsonify({"error": "You cannot delete your own account"}), 400
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User '{user.email}' deleted successfully"}), 200


@admin_bp.route("/admin/users/<int:user_id>/role", methods=["PATCH"])
@admin_required
def change_user_role(user_id):
    """
    PATCH /admin/users/<id>/role — Change a user's role.
    Body: { role: 'student' | 'instructor' | 'admin' }
    Warning: This updates the role only; existing profile data is preserved.
    """
    data = request.get_json() or {}
    new_role = data.get("role", "").lower()
    if new_role not in ("student", "instructor", "admin"):
        return jsonify({"error": "Role must be 'student', 'instructor', or 'admin'"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.role = new_role
    db.session.commit()
    return jsonify({
        "message": f"User role updated to '{new_role}'",
        "user":    user.to_dict()
    }), 200


# ─────────────────────────────────────────────
# Courses
# ─────────────────────────────────────────────
@admin_bp.route("/admin/courses", methods=["GET"])
@admin_required
def get_all_courses():
    """GET /admin/courses — List all courses."""
    courses = Course.query.all()
    return jsonify({
        "total":   len(courses),
        "courses": [c.to_dict() for c in courses]
    }), 200


@admin_bp.route("/admin/courses/<int:course_id>", methods=["DELETE"])
@admin_required
def delete_course(course_id):
    """DELETE /admin/courses/<id> — Force-delete any course."""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": f"Course '{course.title}' deleted successfully"}), 200


# ─────────────────────────────────────────────
# Reservations
# ─────────────────────────────────────────────
@admin_bp.route("/admin/reservations", methods=["GET"])
@admin_required
def get_all_reservations():
    """GET /admin/reservations — List all reservations with optional status filter."""
    status = request.args.get("status")  # ?status=pending|confirmed|cancelled
    query = Reservation.query
    if status:
        query = query.filter_by(status=status.lower())
    reservations = query.all()
    return jsonify({
        "total":        len(reservations),
        "reservations": [r.to_dict() for r in reservations]
    }), 200


@admin_bp.route("/admin/reservations/<int:reservation_id>", methods=["PATCH"])
@admin_required
def update_reservation_status(reservation_id):
    """
    PATCH /admin/reservations/<id> — Update reservation status.
    Body: { status: 'pending' | 'confirmed' | 'cancelled' }
    """
    data = request.get_json() or {}
    new_status = data.get("status", "").lower()
    if new_status not in ("pending", "confirmed", "cancelled"):
        return jsonify({"error": "Status must be 'pending', 'confirmed', or 'cancelled'"}), 400

    reservation = Reservation.query.get(reservation_id)
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    if new_status == "confirmed":
        reservation.confirm()
    elif new_status == "cancelled":
        reservation.cancel()
        # Release the seat back when cancelled
        reservation.course.release_seat()
    else:
        reservation.status = new_status

    db.session.commit()
    return jsonify({
        "message":     f"Reservation status updated to '{new_status}'",
        "reservation": reservation.to_dict()
    }), 200


# ─────────────────────────────────────────────
# Payments
# ─────────────────────────────────────────────
@admin_bp.route("/admin/payments", methods=["GET"])
@admin_required
def get_all_payments():
    """GET /admin/payments — List all payment records."""
    payments = Payment.query.all()
    return jsonify({
        "total":    len(payments),
        "payments": [p.to_dict() for p in payments]
    }), 200


# ─────────────────────────────────────────────
# Enrollments
# ─────────────────────────────────────────────
@admin_bp.route("/admin/enrollments", methods=["GET"])
@admin_required
def get_all_enrollments():
    """GET /admin/enrollments — List all enrollments."""
    enrollments = Enrollment.query.all()
    return jsonify({
        "total":       len(enrollments),
        "enrollments": [e.to_dict() for e in enrollments]
    }), 200


# ─────────────────────────────────────────────
# Dashboard Summary
# ─────────────────────────────────────────────
@admin_bp.route("/admin/dashboard", methods=["GET"])
@admin_required
def admin_dashboard():
    """GET /admin/dashboard — System-wide summary statistics."""
    total_users        = User.query.count()
    total_students     = Student.query.count()
    total_instructors  = Instructor.query.count()
    total_admins       = User.query.filter_by(role="admin").count()
    total_courses      = Course.query.count()
    total_reservations = Reservation.query.count()
    pending_res        = Reservation.query.filter_by(status="pending").count()
    confirmed_res      = Reservation.query.filter_by(status="confirmed").count()
    cancelled_res      = Reservation.query.filter_by(status="cancelled").count()
    total_payments     = Payment.query.count()
    total_enrollments  = Enrollment.query.count()

    return jsonify({
        "summary": {
            "users": {
                "total":       total_users,
                "students":    total_students,
                "instructors": total_instructors,
                "admins":      total_admins,
            },
            "courses":      total_courses,
            "reservations": {
                "total":     total_reservations,
                "pending":   pending_res,
                "confirmed": confirmed_res,
                "cancelled": cancelled_res,
            },
            "payments":    total_payments,
            "enrollments": total_enrollments,
        }
    }), 200
