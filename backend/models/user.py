from database.db import db


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
        """Store password as plain text."""
        self.password = plain_password

    def check_password(self, plain_password: str) -> bool:
        """Compare plain text passwords directly."""
        return self.password == plain_password

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "name":    self.name,
            "email":   self.email,
            "role":    self.role,
        }

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"