from flask import Blueprint, request, jsonify
from database.db import db
from models.payment import Payment
from models.reservation import Reservation
from models.enrollment import Enrollment
from datetime import date
from flask_jwt_extended import get_jwt_identity
from utils.decorators import role_required

payments_bp = Blueprint("payments", __name__)


@payments_bp.route("/payment", methods=["POST"])
@role_required("student")
def make_payment():
    """
    POST /payment
    Student only — process payment for a pending reservation.
    Body: { reservation_id, amount, payment_type }
    """
    identity = get_jwt_identity()

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required = ["reservation_id", "amount", "payment_type"]
    missing = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    reservation = Reservation.query.get(data["reservation_id"])
    if not reservation:
        return jsonify({"error": "Reservation not found"}), 404

    # Ensure the reservation belongs to this student
    student_id = identity.get("student_id")
    if reservation.student_id != student_id:
        return jsonify({"error": "Access denied: This reservation does not belong to you"}), 403

    if reservation.status != "pending":
        return jsonify({"error": f"Cannot pay for a reservation with status '{reservation.status}'"}), 400

    payment = Payment(
        reservation_id = reservation.reservation_id,
        amount         = float(data["amount"]),
        payment_date   = date.today(),
        payment_type   = data["payment_type"],
    )
    db.session.add(payment)

    reservation.confirm()

    enrollment = Enrollment(
        student_id      = reservation.student_id,
        course_id       = reservation.course_id,
        enrollment_date = date.today(),
        status          = "active",
    )
    db.session.add(enrollment)
    db.session.commit()

    return jsonify({
        "message":    "Payment successful. Enrollment confirmed.",
        "payment":    payment.to_dict(),
        "enrollment": enrollment.to_dict(),
    }), 201


@payments_bp.route("/payments", methods=["GET"])
@role_required("student")
def get_payments():
    """
    GET /payments
    Student only — returns all payments for the logged-in student's reservations.
    """
    identity = get_jwt_identity()
    student_id = identity.get("student_id")
    reservations = Reservation.query.filter_by(student_id=student_id).all()
    reservation_ids = [r.reservation_id for r in reservations]

    payments = Payment.query.filter(Payment.reservation_id.in_(reservation_ids)).all()
    return jsonify({
        "total":    len(payments),
        "payments": [p.to_dict() for p in payments]
    }), 200
