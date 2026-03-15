from database.db import db
from datetime import date


class Enrollment(db.Model):
    """
    Represents a confirmed enrollment of a student in a course.
    Created automatically after successful payment.
    OOP: Encapsulates enrollment state and representation.
    """
    __tablename__ = "enrollment"

    enrollment_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id      = db.Column(db.Integer, db.ForeignKey("student.student_id", ondelete="CASCADE"), nullable=False)
    course_id       = db.Column(db.Integer, db.ForeignKey("course.course_id",   ondelete="CASCADE"), nullable=False)
    enrollment_date = db.Column(db.Date, nullable=False, default=date.today)
    status          = db.Column(db.String(20), nullable=False, default="active")  # active | completed | dropped

    # Relationships
    student = db.relationship("Student", back_populates="enrollments")
    course  = db.relationship("Course",  back_populates="enrollments")

    def to_dict(self) -> dict:
        return {
            "enrollment_id":   self.enrollment_id,
            "student_id":      self.student_id,
            "course_id":       self.course_id,
            "course_title":    self.course.title      if self.course   else None,
            "course_price":    float(self.course.price) if self.course else None,
            "student_name":    self.student.user.name if self.student and self.student.user else None,
            "enrollment_date": str(self.enrollment_date),
            "status":          self.status,
        }

    def __repr__(self) -> str:
        return f"<Enrollment id={self.enrollment_id} student={self.student_id} course={self.course_id}>"
