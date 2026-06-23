from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.citizen_bills import CitizenBill, BillStatus
from .base_repository import BaseRepository

class CitizenBillRepository(BaseRepository[CitizenBill]):
    def __init__(self, db: Session):
        super().__init__(CitizenBill, db)

    def get_by_citizen_id(self, citizen_id: int, skip: int = 0, limit: int = 100) -> List[CitizenBill]:
        return self.db.query(CitizenBill).filter(
            CitizenBill.citizen_id == citizen_id
        ).order_by(CitizenBill.created_at.desc()).offset(skip).limit(limit).all()

    def get_pending_bills(self, citizen_id: int) -> List[CitizenBill]:
        return self.db.query(CitizenBill).filter(
            CitizenBill.citizen_id == citizen_id,
            CitizenBill.bill_status.in_([BillStatus.PENDING, BillStatus.OVERDUE])
        ).all()

    def get_bill_history(self, citizen_id: int) -> List[CitizenBill]:
        return self.db.query(CitizenBill).filter(
            CitizenBill.citizen_id == citizen_id,
            CitizenBill.bill_status == BillStatus.PAID
        ).all()

    def update_status(self, bill_id: int, status: BillStatus) -> Optional[CitizenBill]:
        return self.update(bill_id, bill_status=status)

    def generate_bill_number(self) -> str:
        count = self.count()
        return f"BILL-{str(count + 1).zfill(6)}"

    def get_total_pending_amount(self, citizen_id: int) -> float:
        result = self.db.query(func.sum(CitizenBill.total_amount)).filter(
            CitizenBill.citizen_id == citizen_id,
            CitizenBill.bill_status.in_([BillStatus.PENDING, BillStatus.OVERDUE])
        ).scalar()
        return result or 0