from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class BillStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"

class CitizenBill(Base):
    __tablename__ = "citizen_bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(20), unique=True, index=True, nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("bill_categories.id"), nullable=False)
    bill_month = Column(Integer, nullable=False)
    bill_year = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    late_fee = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)
    bill_status = Column(Enum(BillStatus), default=BillStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())