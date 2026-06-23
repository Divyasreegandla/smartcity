from typing import Optional, List
from sqlalchemy.orm import Session
from models.payment_receipts import PaymentReceipt
from .base_repository import BaseRepository

class PaymentReceiptRepository(BaseRepository[PaymentReceipt]):
    def __init__(self, db: Session):
        super().__init__(PaymentReceipt, db)

    def get_by_payment_id(self, payment_id: int) -> Optional[PaymentReceipt]:
        return self.db.query(PaymentReceipt).filter(
            PaymentReceipt.payment_id == payment_id
        ).first()

    def get_by_receipt_number(self, receipt_number: str) -> Optional[PaymentReceipt]:
        return self.db.query(PaymentReceipt).filter(
            PaymentReceipt.receipt_number == receipt_number
        ).first()

    def generate_receipt_number(self) -> str:
        count = self.count()
        return f"REC-{str(count + 1).zfill(6)}"