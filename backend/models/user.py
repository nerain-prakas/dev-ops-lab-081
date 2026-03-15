from database.db import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    """
    Represents a system user (base for Student and Instructor).
    OOP: Base entity with shared authentication attributes.
    """
    __tablename__ = "users"

    user_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name      = db.Column(db.String(100), nullable=False)
    email     = db.Column(db.String(150), unique=True, nullable=False)
    password  = db.Column(db.String(255), nullable=False)
    role      = db.Column(db.String(20), nullable=False)  # 'student' | 'instructor'

    # Relationships
    student    = db.relationship("Student",    back_populates="user", uselist=False, cascade="all, delete-orphan")
    instructor = db.relationship("Instructor", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def set_password(self, plain_password: str) -> None:
        """Hash and store the password."""
        self.password = generate_password_hash(plain_password)

    def check_password(self, plain_password: str) -> bool:
        """Verify a plaintext password against the stored hash."""
        return check_password_hash(self.password, plain_password)

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "name":    self.name,
            "email":   self.email,
            "role":    self.role,
        }

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
