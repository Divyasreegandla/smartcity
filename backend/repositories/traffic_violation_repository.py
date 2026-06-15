from typing import Optional, List
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.traffic_violations import TrafficViolation, PaymentStatus
from .base_repository import BaseRepository


class TrafficViolationRepository(BaseRepository[TrafficViolation]):
    def __init__(self, db: Session):
        super().__init__(TrafficViolation, db)

    def get_by_violation_number(self, violation_number: str) -> Optional[TrafficViolation]:
        return self.db.query(TrafficViolation).filter(
            TrafficViolation.violation_number == violation_number
        ).first()

    def get_by_vehicle(self, vehicle_number: str, skip: int = 0, limit: int = 100) -> List[TrafficViolation]:
        return self.db.query(TrafficViolation).filter(
            TrafficViolation.vehicle_number.ilike(f"%{vehicle_number}%")
        ).order_by(TrafficViolation.violation_date.desc()).offset(skip).limit(limit).all()

    def get_by_payment_status(self, status: PaymentStatus, skip: int = 0, limit: int = 100) -> List[TrafficViolation]:
        return self.db.query(TrafficViolation).filter(
            TrafficViolation.payment_status == status
        ).offset(skip).limit(limit).all()

    def update_payment_status(self, violation_id: int, status: PaymentStatus) -> Optional[TrafficViolation]:
        return self.update(violation_id, payment_status=status)

    def generate_violation_number(self) -> str:
        today = datetime.now().strftime("%Y%m%d")
        count = self.db.query(TrafficViolation).filter(
            TrafficViolation.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
        ).count()
        return f"VLN-{today}-{str(count + 1).zfill(4)}"

    def get_today_count(self) -> int:
        today = date.today()
        return self.db.query(TrafficViolation).filter(
            TrafficViolation.violation_date >= today
        ).count()

    def get_total_fine_collected(self) -> float:
        result = self.db.query(func.sum(TrafficViolation.fine_amount)).filter(
            TrafficViolation.payment_status == PaymentStatus.PAID
        ).scalar()
        return result or 0

    def get_pending_fines_total(self) -> float:
        result = self.db.query(func.sum(TrafficViolation.fine_amount)).filter(
            TrafficViolation.payment_status.in_([PaymentStatus.PENDING, PaymentStatus.OVERDUE])
        ).scalar()
        return result or 0

    def get_statistics(self) -> dict:
        total = self.count()
        paid = self.db.query(TrafficViolation).filter(TrafficViolation.payment_status == PaymentStatus.PAID).count()
        pending = self.db.query(TrafficViolation).filter(TrafficViolation.payment_status == PaymentStatus.PENDING).count()
        total_fine = self.get_total_fine_collected()
        return {"total": total, "paid": paid, "pending": pending, "total_fine_collected": total_fine}