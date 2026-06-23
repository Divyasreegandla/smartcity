# models/payment_receipts.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database.database import Base

class PaymentReceipt(Base):
    __tablename__ = "payment_receipts"  # ← Make sure this is correct

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("bill_payments.id"), nullable=False)
    receipt_number = Column(String(20), unique=True, index=True, nullable=False)
    pdf_path = Column(String(500), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())