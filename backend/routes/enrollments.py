from flask import Blueprint, jsonify
from models.enrollment import Enrollment
from models.student import Student
from utils.jwt_auth import jwt_required, get_jwt_identity

enrollments_bp = Blueprint("enrollments", __name__)


@enrollments_bp.route("/enrollments", methods=["GET"])
@jwt_required()
def get_enrollments():
    """
    GET /enrollments
    Returns all enrollments for the currently logged-in student.
    Instructors can also call this to see enrollments in their courses (future scope).
    """
    identity = get_jwt_identity()

    if identity.get("role") == "student":
        student = Student.query.filter_by(user_id=identity["user_id"]).first()
        if not student:
            return jsonify({"error": "Student profile not found"}), 404

        enrollments = Enrollment.query.filter_by(student_id=student.student_id).all()
        return jsonify({
            "total":       len(enrollments),
            "enrollments": [e.to_dict() for e in enrollments]
        }), 200

    elif identity.get("role") == "instructor":
        # Instructors see enrollments for all their courses
        from models.course import Course
        from models.instructor import Instructor

        instructor = Instructor.query.filter_by(user_id=identity["user_id"]).first()
        if not instructor:
            return jsonify({"error": "Instructor profile not found"}), 404

        course_ids = [c.course_id for c in instructor.courses]
        enrollments = Enrollment.query.filter(Enrollment.course_id.in_(course_ids)).all()
        return jsonify({
            "total":       len(enrollments),
            "enrollments": [e.to_dict() for e in enrollments]
        }), 200

    return jsonify({"error": "Unauthorized"}), 403
