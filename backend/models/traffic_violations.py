from sqlalchemy import Column, Integer, String, DateTime, Enum, Float, ForeignKey
from sqlalchemy.sql import func
from database.database import Base
import enum


class ViolationType(str, enum.Enum):
    SPEEDING = "speeding"
    RED_LIGHT = "red_light"
    WRONG_WAY = "wrong_way"
    NO_HELMET = "no_helmet"
    NO_SEATBELT = "no_seatbelt"
    ILLEGAL_PARKING = "illegal_parking"
    OTHER = "other"

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class TrafficViolation(Base):
    __tablename__ = "traffic_violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_number = Column(String(20), unique=True, index=True, nullable=False)
    vehicle_number = Column(String(20), nullable=False)
    violation_type = Column(Enum(ViolationType), nullable=False)
    location = Column(String(255), nullable=False)
    fine_amount = Column(Float, nullable=False)
    violation_date = Column(DateTime, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())