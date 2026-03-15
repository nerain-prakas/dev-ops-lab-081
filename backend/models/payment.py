from database.db import db
from datetime import date


class Payment(db.Model):
    """
    Represents a payment made for a reservation.
    OOP: Encapsulates payment data and formatting logic.
    """
    __tablename__ = "payment"

    payment_id      = db.Column(db.Integer, primary_key=True, autoincrement=True)
    reservation_id  = db.Column(db.Integer, db.ForeignKey("reservation.reservation_id", ondelete="CASCADE"), nullable=False)
    amount          = db.Column(db.Numeric(10, 2), nullable=False)
    payment_date    = db.Column(db.Date, nullable=False, default=date.today)
    payment_type    = db.Column(db.String(50), nullable=False)  # e.g. 'credit_card', 'upi', 'cash'

    # Relationships
    reservation = db.relationship("Reservation", back_populates="payments")

    def to_dict(self) -> dict:
        return {
            "payment_id":     self.payment_id,
            "reservation_id": self.reservation_id,
            "amount":         float(self.amount),
            "payment_date":   str(self.payment_date),
            "payment_type":   self.payment_type,
        }

    def __repr__(self) -> str:
        return f"<Payment id={self.payment_id} amount={self.amount} type={self.payment_type}>"
