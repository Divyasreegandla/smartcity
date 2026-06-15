from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.traffic_violation_repository import TrafficViolationRepository
from schemas.traffic_violation_schemas import TrafficViolationCreate, TrafficViolationUpdate


class TrafficViolationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TrafficViolationRepository(db)

    def create_violation(self, data: TrafficViolationCreate, reported_by: int):
        violation_number = self.repo.generate_violation_number()
        violation = self.repo.create(
            violation_number=violation_number,
            reported_by=reported_by,
            **data.model_dump()
        )
        return violation

    def get_all_violations(self, skip: int = 0, limit: int = 100, vehicle_number: str = None, payment_status: str = None):
        if vehicle_number:
            return self.repo.get_by_vehicle(vehicle_number, skip, limit)
        if payment_status:
            return self.repo.get_by_payment_status(payment_status, skip, limit)
        return self.repo.get_all(skip=skip, limit=limit)

    def get_violation_by_id(self, violation_id: int):
        return self.repo.get_by_id(violation_id)

    def update_payment_status(self, violation_id: int, payment_status: str):
        violation = self.repo.get_by_id(violation_id)
        if not violation:
            return None
        return self.repo.update_payment_status(violation_id, payment_status)

    def get_today_count(self) -> int:
        return self.repo.get_today_count()

    def get_total_fine_collected(self) -> float:
        return self.repo.get_total_fine_collected()

    def get_pending_fines_total(self) -> float:
        return self.repo.get_pending_fines_total()

    def get_dashboard_stats(self) -> Dict:
        return self.repo.get_statistics()