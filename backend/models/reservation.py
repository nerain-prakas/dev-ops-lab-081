from database.db import db
from datetime import date


class Reservation(db.Model):
    """
    Represents a student's course seat reservation.
    OOP: Encapsulates status transition logic within the class.
    """
    __tablename__ = "reservation"

    reservation_id   = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id       = db.Column(db.Integer, db.ForeignKey("student.student_id", ondelete="CASCADE"), nullable=False)
    course_id        = db.Column(db.Integer, db.ForeignKey("course.course_id",   ondelete="CASCADE"), nullable=False)
    reservation_date = db.Column(db.Date, nullable=False, default=date.today)
    status           = db.Column(db.String(20), nullable=False, default="pending")  # pending | confirmed | cancelled

    # Relationships
    student  = db.relationship("Student", back_populates="reservations")
    course   = db.relationship("Course",  back_populates="reservations")
    payments = db.relationship("Payment", back_populates="reservation", cascade="all, delete-orphan")

    def confirm(self) -> None:
        """Transition reservation status to confirmed."""
        self.status = "confirmed"

    def cancel(self) -> None:
        """Transition reservation status to cancelled."""
        self.status = "cancelled"

    def to_dict(self) -> dict:
        return {
            "reservation_id":   self.reservation_id,
            "student_id":       self.student_id,
            "course_id":        self.course_id,
            "course_title":     self.course.title   if self.course   else None,
            "student_name":     self.student.user.name if self.student and self.student.user else None,
            "reservation_date": str(self.reservation_date),
            "status":           self.status,
        }

    def __repr__(self) -> str:
        return f"<Reservation id={self.reservation_id} status={self.status}>"
