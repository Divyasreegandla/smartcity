# models/bill_payments.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from database.database import Base
import enum

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentGateway(str, enum.Enum):
    STRIPE = "stripe"
    RAZORPAY = "razorpay"
    CASHFREE = "cashfree"

class BillPayment(Base):
    __tablename__ = "bill_payments"  # ← Make sure this is correct

    id = Column(Integer, primary_key=True, index=True)
    payment_reference = Column(String(50), unique=True, index=True, nullable=False)
    bill_id = Column(Integer, ForeignKey("citizen_bills.id"), nullable=False)
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    payment_gateway = Column(Enum(PaymentGateway), nullable=False)
    transaction_id = Column(String(100), nullable=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    paid_amount = Column(Float, nullable=False)
    gateway_response = Column(String(1000), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())