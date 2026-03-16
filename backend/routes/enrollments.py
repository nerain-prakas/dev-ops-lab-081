from flask import Blueprint, jsonify
from models.enrollment import Enrollment
from models.student import Student
from models.course import Course
from models.instructor import Instructor
from flask_jwt_extended import get_jwt_identity
from utils.decorators import role_required

enrollments_bp = Blueprint("enrollments", __name__)


@enrollments_bp.route("/enrollments", methods=["GET"])
@role_required("student", "instructor")
def get_enrollments():
    """
    GET /enrollments
    - Student: returns their own enrollments.
    - Instructor: returns enrollments for all their courses.
    - Admin uses /admin/enrollments instead.
    """
    identity = get_jwt_identity()
    role = identity.get("role")

    if role == "student":
        student = Student.query.filter_by(user_id=identity["user_id"]).first()
        if not student:
            return jsonify({"error": "Student profile not found"}), 404

        enrollments = Enrollment.query.filter_by(student_id=student.student_id).all()
        return jsonify({
            "total":       len(enrollments),
            "enrollments": [e.to_dict() for e in enrollments]
        }), 200

    # instructor
    instructor = Instructor.query.filter_by(user_id=identity["user_id"]).first()
    if not instructor:
        return jsonify({"error": "Instructor profile not found"}), 404

    course_ids  = [c.course_id for c in instructor.courses]
    enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()
    return jsonify({
        "total":       len(enrollments),
        "enrollments": [e.to_dict() for e in enrollments]
    }), 200
