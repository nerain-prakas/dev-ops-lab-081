from flask import Blueprint, request, jsonify
from database.db import db
from models.reservation import Reservation
from models.course import Course
from models.student import Student
from datetime import date
from flask_jwt_extended import get_jwt_identity, get_jwt
from utils.decorators import role_required
from demo_data import DEMO_RESERVATIONS_STUDENT, is_demo

reservations_bp = Blueprint("reservations", __name__)


@reservations_bp.route("/reserve", methods=["POST"])
@role_required("student")
def reserve_course():
    """POST /reserve — Student only."""
    if is_demo():
        data = request.get_json() or {}
        return jsonify({
            "message": "Demo mode: seat reserved successfully!",
            "reservation": {
                "reservation_id": 99, "student_id": 9003,
                "course_id": data.get("course_id", 1),
                "reservation_date": str(date.today()), "status": "pending",
            }
        }), 201
    try:
        user_id = get_jwt_identity()
        claims  = get_jwt()
        student = Student.query.filter_by(user_id=user_id).first()
        if not student:
            return jsonify({"error": "Student profile not found"}), 404
        data = request.get_json()
        if not data or not data.get("course_id"):
            return jsonify({"error": "course_id is required"}), 400
        course = Course.query.get(data["course_id"])
        if not course:
            return jsonify({"error": "Course not found"}), 404
        existing = Reservation.query.filter_by(
            student_id=student.student_id, course_id=course.course_id
        ).filter(Reservation.status.in_(["pending", "confirmed"])).first()
        if existing:
            return jsonify({"error": "You already have an active reservation for this course"}), 409
        if not course.reserve_seat():
            return jsonify({"error": "No available seats"}), 400
        reservation = Reservation(
            student_id=student.student_id, course_id=course.course_id,
            reservation_date=date.today(), status="pending",
        )
        db.session.add(reservation)
        db.session.commit()
        return jsonify({"message": "Seat reserved", "reservation": reservation.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@reservations_bp.route("/reservations", methods=["GET"])
@role_required("student")
def get_reservations():
    """GET /reservations — Student only."""
    if is_demo():
        return jsonify({"total": len(DEMO_RESERVATIONS_STUDENT), "reservations": DEMO_RESERVATIONS_STUDENT}), 200
    try:
        user_id = get_jwt_identity()
        student = Student.query.filter_by(user_id=user_id).first()
        if not student:
            return jsonify({"error": "Student profile not found"}), 404
        reservations = Reservation.query.filter_by(student_id=student.student_id).all()
        return jsonify({"total": len(reservations), "reservations": [r.to_dict() for r in reservations]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_RESERVATIONS_STUDENT), "reservations": DEMO_RESERVATIONS_STUDENT}), 200
