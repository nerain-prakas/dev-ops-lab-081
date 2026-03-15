from flask import Blueprint, request, jsonify
from database.db import db
from models.user import User
from models.student import Student
from models.instructor import Instructor
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /register
    Register a new user as 'student', 'instructor', or 'admin'.
    Body: { name, email, password, role, phone (student only), specialization (instructor only) }
    Note: 'admin' registration requires a valid admin_secret header for security.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Validate required fields
    required = ["name", "email", "password", "role"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    role = data["role"].lower()
    if role not in ("student", "instructor", "admin"):
        return jsonify({"error": "Role must be 'student', 'instructor', or 'admin'"}), 400

    # Admin registration requires a secret key
    if role == "admin":
        import os
        admin_secret = request.headers.get("X-Admin-Secret", "")
        expected     = os.getenv("ADMIN_SECRET", "admin-secret-2024")
        if admin_secret != expected:
            return jsonify({"error": "Invalid admin secret. Include X-Admin-Secret header."}), 403

    # Check for duplicate email
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Create the base User
    user = User(name=data["name"], email=data["email"], role=role)
    user.set_password(data["password"])
    db.session.add(user)
    db.session.flush()  # Flush to get user.user_id before commit

    # Create role-specific profile (admin has no separate profile table)
    if role == "student":
        profile = Student(user_id=user.user_id, phone=data.get("phone"))
        db.session.add(profile)
    elif role == "instructor":
        profile = Instructor(user_id=user.user_id, specialization=data.get("specialization"))
        db.session.add(profile)
    # admin: no extra profile needed

    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user":    user.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /login
    Authenticate an existing user and return a JWT token.
    Body: { email, password }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    email    = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Embed user info in the JWT identity
    identity = {
        "user_id": user.user_id,
        "role":    user.role,
    }

    # Attach profile-specific id
    if user.role == "student" and user.student:
        identity["student_id"] = user.student.student_id
    elif user.role == "instructor" and user.instructor:
        identity["instructor_id"] = user.instructor.instructor_id
    elif user.role == "admin":
        identity["is_admin"] = True

    access_token = create_access_token(identity=identity)

    return jsonify({
        "message":      "Login successful",
        "access_token": access_token,
        "user":         user.to_dict()
    }), 200
