from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.bill_payments import BillPayment, PaymentStatus
from .base_repository import BaseRepository

class BillPaymentRepository(BaseRepository[BillPayment]):
    def __init__(self, db: Session):
        super().__init__(BillPayment, db)

    def get_by_citizen_id(self, citizen_id: int, skip: int = 0, limit: int = 100) -> List[BillPayment]:
        return self.db.query(BillPayment).filter(
            BillPayment.citizen_id == citizen_id
        ).order_by(BillPayment.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_bill_id(self, bill_id: int) -> List[BillPayment]:
        return self.db.query(BillPayment).filter(
            BillPayment.bill_id == bill_id
        ).all()

    def get_by_transaction_id(self, transaction_id: str) -> Optional[BillPayment]:
        return self.db.query(BillPayment).filter(
            BillPayment.transaction_id == transaction_id
        ).first()

    def get_by_payment_reference(self, payment_reference: str) -> Optional[BillPayment]:
        return self.db.query(BillPayment).filter(
            BillPayment.payment_reference == payment_reference
        ).first()

    def get_by_status(self, status: PaymentStatus, skip: int = 0, limit: int = 100) -> List[BillPayment]:
        return self.db.query(BillPayment).filter(
            BillPayment.payment_status == status
        ).offset(skip).limit(limit).all()

    def update_status(self, payment_id: int, status: PaymentStatus) -> Optional[BillPayment]:
        return self.update(payment_id, payment_status=status)

    def get_total_paid(self, citizen_id: int) -> float:
        result = self.db.query(func.sum(BillPayment.paid_amount)).filter(
            BillPayment.citizen_id == citizen_id,
            BillPayment.payment_status == PaymentStatus.SUCCESS
        ).scalar()
        return result or 0

    def get_pending_payments(self, citizen_id: int) -> List[BillPayment]:
        return self.db.query(BillPayment).filter(
            BillPayment.citizen_id == citizen_id,
            BillPayment.payment_status == PaymentStatus.PENDING
        ).all()

    def generate_payment_reference(self) -> str:
        count = self.count()
        return f"PAY-{str(count + 1).zfill(6)}"