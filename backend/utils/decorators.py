"""
Shared authentication/authorization decorators.
Import these in any blueprint to protect routes by role.

NOTE: Flask-JWT-Extended v4.x stores identity as 'sub' (must be a scalar string).
      Role and profile IDs are stored as 'additional_claims' in the JWT.
      Use get_jwt() to read claims; use get_jwt_identity() to get the user_id string.
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt


def role_required(*roles):
    """
    Decorator factory that restricts an endpoint to one or more roles.

    Usage:
        @role_required("student")
        @role_required("instructor", "admin")
        @role_required("student", "instructor", "admin")

    The decorator:
      1. Enforces a valid JWT (equivalent to @jwt_required()).
      2. Reads the 'role' field from the JWT additional claims.
      3. Returns 403 if the caller's role is not in the allowed list.
    """
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()           # reads additional_claims + standard fields
            caller_role = claims.get("role", "")
            if caller_role not in roles:
                allowed = " / ".join(roles)
                return jsonify({
                    "error": f"Access denied. Required role(s): {allowed}. "
                             f"Your role: {caller_role}"
                }), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(fn):
    """
    Shorthand decorator for admin-only endpoints.
    Equivalent to @role_required("admin").
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Access denied: Admins only"}), 403
        return fn(*args, **kwargs)
    return wrapper
