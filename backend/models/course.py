from database.db import db


class Course(db.Model):
    """
    Represents a course offered by an instructor.
    OOP: Encapsulates seat management logic within the class.
    """
    __tablename__ = "course"

    course_id       = db.Column(db.Integer, primary_key=True, autoincrement=True)
    instructor_id   = db.Column(db.Integer, db.ForeignKey("instructor.instructor_id", ondelete="CASCADE"), nullable=False)
    title           = db.Column(db.String(200), nullable=False)
    description     = db.Column(db.Text, nullable=True)
    price           = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    total_seats     = db.Column(db.Integer, nullable=False, default=0)
    available_seats = db.Column(db.Integer, nullable=False, default=0)

    # Relationships
    instructor   = db.relationship("Instructor",  back_populates="courses")
    reservations = db.relationship("Reservation", back_populates="course", cascade="all, delete-orphan")
    enrollments  = db.relationship("Enrollment",  back_populates="course", cascade="all, delete-orphan")

    def reserve_seat(self) -> bool:
        """
        Decrements available_seats by 1 if seats are available.
        Returns True if successful, False if no seats left.
        """
        if self.available_seats > 0:
            self.available_seats -= 1
            return True
        return False

    def release_seat(self) -> None:
        """Increments available_seats by 1 (e.g., on cancellation)."""
        if self.available_seats < self.total_seats:
            self.available_seats += 1

    def to_dict(self) -> dict:
        return {
            "course_id":       self.course_id,
            "instructor_id":   self.instructor_id,
            "instructor_name": self.instructor.user.name if self.instructor and self.instructor.user else None,
            "title":           self.title,
            "description":     self.description,
            "price":           float(self.price),
            "total_seats":     self.total_seats,
            "available_seats": self.available_seats,
        }

    def __repr__(self) -> str:
        return f"<Course '{self.title}' (seats: {self.available_seats}/{self.total_seats})>"
