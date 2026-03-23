from flask import Blueprint, jsonify
from models.enrollment import Enrollment
from models.student import Student
from models.instructor import Instructor
from flask_jwt_extended import get_jwt_identity, get_jwt
from utils.decorators import role_required
from demo_data import DEMO_ENROLLMENTS_STUDENT, DEMO_ENROLLMENTS_INSTRUCTOR, is_demo

enrollments_bp = Blueprint("enrollments", __name__)


@enrollments_bp.route("/enrollments", methods=["GET"])
@role_required("student", "instructor")
def get_enrollments():
    """
    GET /enrollments
    - Student  → their own enrollments
    - Instructor → enrollments for their courses
    """
    if is_demo():
        claims = get_jwt()
        role   = claims.get("role", "")
        data   = DEMO_ENROLLMENTS_STUDENT if role == "student" else DEMO_ENROLLMENTS_INSTRUCTOR
        return jsonify({"total": len(data), "enrollments": data}), 200

    user_id = get_jwt_identity()      # string
    claims  = get_jwt()
    role    = claims.get("role", "")

    try:
        if role == "student":
            student = Student.query.filter_by(user_id=user_id).first()
            if not student:
                return jsonify({"error": "Student profile not found"}), 404
            enrollments = Enrollment.query.filter_by(student_id=student.student_id).all()
        else:
            instructor = Instructor.query.filter_by(user_id=user_id).first()
            if not instructor:
                return jsonify({"error": "Instructor profile not found"}), 404
            course_ids  = [c.course_id for c in instructor.courses]
            enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()

        return jsonify({"total": len(enrollments), "enrollments": [e.to_dict() for e in enrollments]}), 200
    except Exception:
        data = DEMO_ENROLLMENTS_STUDENT if role == "student" else DEMO_ENROLLMENTS_INSTRUCTOR
        return jsonify({"total": len(data), "enrollments": data}), 200
