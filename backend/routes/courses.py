from flask import Blueprint, request, jsonify
from database.db import db
from models.course import Course
from models.instructor import Instructor
from flask_jwt_extended import get_jwt_identity
from utils.decorators import role_required

courses_bp = Blueprint("courses", __name__)


@courses_bp.route("/courses", methods=["GET"])
def get_courses():
    """
    GET /courses
    Public endpoint — returns all available courses.
    Optional query params: ?title=<search>&min_price=<n>&max_price=<n>
    """
    query = Course.query

    title     = request.args.get("title")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)

    if title:
        query = query.filter(Course.title.ilike(f"%{title}%"))
    if min_price is not None:
        query = query.filter(Course.price >= min_price)
    if max_price is not None:
        query = query.filter(Course.price <= max_price)

    courses = query.all()
    return jsonify({
        "total":   len(courses),
        "courses": [c.to_dict() for c in courses]
    }), 200


@courses_bp.route("/courses/<int:course_id>", methods=["GET"])
def get_course(course_id: int):
    """
    GET /courses/<id>
    Public endpoint — returns details for a specific course.
    """
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Course not found"}), 404
    return jsonify({"course": course.to_dict()}), 200


@courses_bp.route("/courses", methods=["POST"])
@role_required("instructor")
def create_course():
    """
    POST /courses
    Instructor only — creates a new course.
    Body: { title, description, price, total_seats }
    """
    identity = get_jwt_identity()

    instructor = Instructor.query.filter_by(user_id=identity["user_id"]).first()
    if not instructor:
        return jsonify({"error": "Instructor profile not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    required = ["title", "price", "total_seats"]
    missing = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    total_seats = int(data["total_seats"])
    course = Course(
        instructor_id   = instructor.instructor_id,
        title           = data["title"],
        description     = data.get("description", ""),
        price           = float(data["price"]),
        total_seats     = total_seats,
        available_seats = total_seats,
    )
    db.session.add(course)
    db.session.commit()

    return jsonify({
        "message": "Course created successfully",
        "course":  course.to_dict()
    }), 201


@courses_bp.route("/courses/<int:course_id>", methods=["PUT"])
@role_required("instructor")
def update_course(course_id: int):
    """
    PUT /courses/<id>
    Instructor only — updates their own course.
    Body: { title?, description?, price?, total_seats? }
    """
    identity   = get_jwt_identity()
    instructor = Instructor.query.filter_by(user_id=identity["user_id"]).first()
    course     = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404
    if not instructor or course.instructor_id != instructor.instructor_id:
        return jsonify({"error": "Access denied: Not your course"}), 403

    data = request.get_json() or {}
    if "title"       in data: course.title       = data["title"]
    if "description" in data: course.description = data["description"]
    if "price"       in data: course.price       = float(data["price"])
    if "total_seats" in data:
        diff = int(data["total_seats"]) - course.total_seats
        course.total_seats     = int(data["total_seats"])
        course.available_seats = max(0, course.available_seats + diff)

    db.session.commit()
    return jsonify({
        "message": "Course updated successfully",
        "course":  course.to_dict()
    }), 200


@courses_bp.route("/courses/<int:course_id>", methods=["DELETE"])
@role_required("instructor")
def delete_course(course_id: int):
    """
    DELETE /courses/<id>
    Instructor only — deletes their own course.
    """
    identity   = get_jwt_identity()
    instructor = Instructor.query.filter_by(user_id=identity["user_id"]).first()
    course     = Course.query.get(course_id)

    if not course:
        return jsonify({"error": "Course not found"}), 404
    if not instructor or course.instructor_id != instructor.instructor_id:
        return jsonify({"error": "Access denied: Not your course"}), 403

    db.session.delete(course)
    db.session.commit()
    return jsonify({"message": "Course deleted successfully"}), 200


@courses_bp.route("/courses/my", methods=["GET"])
@role_required("instructor")
def get_my_courses():
    """
    GET /courses/my
    Instructor only — returns only the courses belonging to the logged-in instructor.
    """
    identity   = get_jwt_identity()
    instructor = Instructor.query.filter_by(user_id=identity["user_id"]).first()
    if not instructor:
        return jsonify({"error": "Instructor profile not found"}), 404

    courses = Course.query.filter_by(instructor_id=instructor.instructor_id).all()
    return jsonify({
        "total":   len(courses),
        "courses": [c.to_dict() for c in courses]
    }), 200
