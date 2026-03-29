from flask import Blueprint, request, jsonify
from database.db import db
from models.payment import Payment
from models.reservation import Reservation
from models.enrollment import Enrollment
from models.student import Student
from models.course import Course
from datetime import date
from flask_jwt_extended import get_jwt_identity, get_jwt
from utils.decorators import role_required
from demo_data import DEMO_PAYMENTS_STUDENT, is_demo
from uuid import UUID

payments_bp = Blueprint("payments", __name__)


def _is_valid_uuid(value) -> bool:
    try:
        UUID(str(value))
        return True
    except Exception:
        return False


def _resolve_current_student():
    """Resolve student from JWT identity/claims safely for UUID-based schemas."""
    user_id = get_jwt_identity()
    claims = get_jwt()

    if _is_valid_uuid(user_id):
        student = Student.query.filter_by(user_id=str(user_id)).first()
        if student:
            return student

    claim_student_id = claims.get("student_id")
    if _is_valid_uuid(claim_student_id):
        student = Student.query.get(str(claim_student_id))
        if student:
            return student

    return None


@payments_bp.route("/payment", methods=["POST"])
@role_required("student")
def make_payment():
    """POST /payment — Student only."""
    if is_demo():
        data = request.get_json() or {}
        return jsonify({
            "message": "Demo mode: payment processed successfully!",
            "payment": {
                "payment_id": 99,
                "reservation_id": data.get("reservation_id", 1),
                "amount": float(data.get("amount", 0)),
                "payment_date": str(date.today()),
                "payment_type": data.get("payment_type", "credit_card"),
            },
            "enrollment": {
                "enrollment_id": 99, "student_id": 9003, "course_id": 1,
                "enrollment_date": str(date.today()), "status": "active",
            }
        }), 201
    try:
        student = _resolve_current_student()
        if not student:
            return jsonify({"error": "Invalid student session. Please login again."}), 401

        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        required = ["reservation_id", "payment_type"]
        missing  = [f for f in required if data.get(f) is None]
        if missing:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

        reservation = Reservation.query.get(str(data["reservation_id"]))
        if not reservation:
            return jsonify({"error": "Reservation not found"}), 404

        # Normalize IDs to string to avoid false mismatch between uuid/int types.
        if str(reservation.student_id) != str(student.student_id):
            return jsonify({"error": "Access denied"}), 403
        if reservation.status != "pending":
            return jsonify({"error": f"Cannot pay for a {reservation.status} reservation"}), 400

        # Always use authoritative course fee from DB; never trust client-sent amount.
        course = Course.query.get(str(reservation.course_id))
        if not course:
            return jsonify({"error": "Course not found for reservation"}), 404
        amount = float(course.price)

        payment = Payment(
            reservation_id=reservation.reservation_id,
            amount=amount,
            payment_date=date.today(),
            payment_type=data["payment_type"],
        )
        db.session.add(payment)
        reservation.confirm()
        enrollment = Enrollment(
            student_id=reservation.student_id,
            course_id=reservation.course_id,
            enrollment_date=date.today(),
            status="active",
        )
        db.session.add(enrollment)
        db.session.commit()
        return jsonify({
            "message":    "Payment successful. Enrollment confirmed.",
            "payment":    payment.to_dict(),
            "enrollment": enrollment.to_dict(),
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@payments_bp.route("/payments", methods=["GET"])
@role_required("student")
def get_payments():
    """GET /payments — Student only."""
    if is_demo():
        return jsonify({"total": len(DEMO_PAYMENTS_STUDENT), "payments": DEMO_PAYMENTS_STUDENT}), 200
    try:
        student = _resolve_current_student()
        if not student:
            return jsonify({"total": 0, "payments": []}), 200
        student_id = student.student_id
        reservations    = Reservation.query.filter_by(student_id=student_id).all()
        reservation_ids = [r.reservation_id for r in reservations]
        payments = Payment.query.filter(Payment.reservation_id.in_(reservation_ids)).all()
        return jsonify({"total": len(payments), "payments": [p.to_dict() for p in payments]}), 200
    except Exception:
        return jsonify({"total": len(DEMO_PAYMENTS_STUDENT), "payments": DEMO_PAYMENTS_STUDENT}), 200
