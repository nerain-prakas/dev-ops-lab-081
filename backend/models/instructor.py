from database.db import db


class Instructor(db.Model):
    """
    Represents an instructor user profile.
    OOP: Extends User via user_id foreign key (composition pattern).
    """
    __tablename__ = "instructor"

    instructor_id  = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    specialization = db.Column(db.String(200), nullable=True)

    # Relationships
    user    = db.relationship("User",   back_populates="instructor")
    courses = db.relationship("Course", back_populates="instructor", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "instructor_id":  self.instructor_id,
            "user_id":        self.user_id,
            "name":           self.user.name  if self.user else None,
            "email":          self.user.email if self.user else None,
            "specialization": self.specialization,
        }

    def __repr__(self) -> str:
        return f"<Instructor id={self.instructor_id} user_id={self.user_id}>"
