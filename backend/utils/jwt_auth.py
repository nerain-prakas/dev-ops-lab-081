import os
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import jsonify, request, g


def _get_secret_key() -> str:
    return os.getenv("JWT_SECRET_KEY", "change-this-secret-key")


def create_access_token(identity: dict) -> str:
    payload = {
        "identity": identity,
        "iat": datetime.now(timezone.utc),
        # Keep the current no-expiry behavior by pushing exp far into the future.
        "exp": datetime.now(timezone.utc) + timedelta(days=3650),
    }
    return jwt.encode(payload, _get_secret_key(), algorithm="HS256")


def get_jwt_identity():
    return getattr(g, "jwt_identity", None)


def jwt_required():
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Missing or invalid authorization header"}), 401

            token = auth_header.split(" ", 1)[1].strip()
            if not token:
                return jsonify({"error": "Missing or invalid authorization header"}), 401

            try:
                payload = jwt.decode(token, _get_secret_key(), algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token has expired"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token"}), 401

            g.jwt_identity = payload.get("identity")
            return fn(*args, **kwargs)

        return wrapper

    return decorator
