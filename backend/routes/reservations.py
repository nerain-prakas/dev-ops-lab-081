from flask import Blueprint, request, jsonify
from database.db import db
from models.reservation import Reservation
from models.course import Course
from models.student import Student
from datetime import date
from flask_jwt_extended import jwt_required, get_jwt_identity

reservations_bp = Blueprint("reservations", __name__)


@reservations_bp.route("/reserve", methods=["POST"])
@jwt_required()
def reserve_course():
    """
    POST /reserve
    Student only — reserve a seat in a course.
    Body: { course_id }

    Business logic:
    - Verify student role and profile.
    - Check course exists and has available seats.
    - Call course.reserve_seat() to decrement available_seats.
    - Create a Reservation with status 'pending'.
    """
    identity = get_jwt_identity()
    if identity.get("role") != "student":
        return jsonify({"error": "Access denied: Students only"}), 403

    student = Student.query.filter_by(user_id=identity["user_id"]).first()
    if not student:
        return jsonify({"error": "Student profile not found"}), 404

    data = request.get_json()
    if not data or not data.get("course_id"):
        return jsonify({"error": "course_id is required"}), 400

    course = Course.query.get(data["course_id"])
    if not course:
        return jsonify({"error": "Course not found"}), 404

    # Check if student already has an active reservation for this course
    existing = Reservation.query.filter_by(
        student_id=student.student_id,
        course_id=course.course_id
    ).filter(Reservation.status.in_(["pending", "confirmed"])).first()

    if existing:
        return jsonify({"error": "You already have an active reservation for this course"}), 409

    # Attempt to reserve a seat (OOP method on Course)
    if not course.reserve_seat():
        return jsonify({"error": "No available seats in this course"}), 400

    reservation = Reservation(
        student_id       = student.student_id,
        course_id        = course.course_id,
        reservation_date = date.today(),
        status           = "pending",
    )
    db.session.add(reservation)
    db.session.commit()

    return jsonify({
        "message":     "Seat reserved successfully",
        "reservation": reservation.to_dict()
    }), 201


@reservations_bp.route("/reservations", methods=["GET"])
@jwt_required()
def get_reservations():
    """
    GET /reservations
    Returns all reservations for the currently logged-in student.
    """
    identity = get_jwt_identity()
    if identity.get("role") != "student":
        return jsonify({"error": "Access denied: Students only"}), 403

    student = Student.query.filter_by(user_id=identity["user_id"]).first()
    if not student:
        return jsonify({"error": "Student profile not found"}), 404

    reservations = Reservation.query.filter_by(student_id=student.student_id).all()
    return jsonify({
        "total":        len(reservations),
        "reservations": [r.to_dict() for r in reservations]
    }), 200
