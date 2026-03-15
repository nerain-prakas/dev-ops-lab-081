from database.db import db


class Student(db.Model):
    """
    Represents a student user profile.
    OOP: Extends User via user_id foreign key (composition pattern).
    """
    __tablename__ = "student"

    student_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, unique=True)
    phone      = db.Column(db.String(20), nullable=True)

    # Relationships
    user         = db.relationship("User",        back_populates="student")
    reservations = db.relationship("Reservation", back_populates="student", cascade="all, delete-orphan")
    enrollments  = db.relationship("Enrollment",  back_populates="student", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "student_id": self.student_id,
            "user_id":    self.user_id,
            "name":       self.user.name  if self.user else None,
            "email":      self.user.email if self.user else None,
            "phone":      self.phone,
        }

    def __repr__(self) -> str:
        return f"<Student id={self.student_id} user_id={self.user_id}>"
