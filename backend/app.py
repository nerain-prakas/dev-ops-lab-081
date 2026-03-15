from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from config import Config
from database.db import db

# Import all models to register them with SQLAlchemy before create_all()
import models  # noqa: F401

# Import route blueprints
from routes.auth import auth_bp
from routes.courses import courses_bp
from routes.reservations import reservations_bp
from routes.payments import payments_bp
from routes.enrollments import enrollments_bp
from routes.admin import admin_bp


def create_app() -> Flask:
    """
    Application factory pattern.
    Creates and configures the Flask app instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Register blueprints (all routes have /api prefix)
    app.register_blueprint(auth_bp,          url_prefix="/api")
    app.register_blueprint(courses_bp,       url_prefix="/api")
    app.register_blueprint(reservations_bp,  url_prefix="/api")
    app.register_blueprint(payments_bp,      url_prefix="/api")
    app.register_blueprint(enrollments_bp,   url_prefix="/api")
    app.register_blueprint(admin_bp,         url_prefix="/api")

    # Create all database tables on startup
    with app.app_context():
        db.create_all()
        print("✅ Database tables created/verified successfully.")

    # ------------------------------------------------------------------
    # Global error handlers
    # ------------------------------------------------------------------
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    # ------------------------------------------------------------------
    # Health check route
    # ------------------------------------------------------------------
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status":  "ok",
            "message": "Online Course Reservation System API is running"
        }), 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)
