from typing import Optional, List
from sqlalchemy.orm import Session
from models.sanitation_workers import SanitationWorker, WorkerStatus, ShiftType
from .base_repository import BaseRepository


class SanitationWorkerRepository(BaseRepository[SanitationWorker]):
    def __init__(self, db: Session):
        super().__init__(SanitationWorker, db)

    def get_by_employee_code(self, employee_code: str) -> Optional[SanitationWorker]:
        """Get worker by employee code"""
        return self.db.query(SanitationWorker).filter(
            SanitationWorker.employee_code == employee_code.upper()
        ).first()

    def get_by_status(self, status: WorkerStatus, skip: int = 0, limit: int = 100) -> List[SanitationWorker]:
        """Get workers by status"""
        return self.db.query(SanitationWorker).filter(
            SanitationWorker.status == status
        ).offset(skip).limit(limit).all()

    def get_by_shift(self, shift_type: ShiftType, skip: int = 0, limit: int = 100) -> List[SanitationWorker]:
        """Get workers by shift"""
        return self.db.query(SanitationWorker).filter(
            SanitationWorker.shift_type == shift_type
        ).offset(skip).limit(limit).all()

    def get_by_area(self, area_name: str, skip: int = 0, limit: int = 100) -> List[SanitationWorker]:
        """Get workers by assigned area"""
        return self.db.query(SanitationWorker).filter(
            SanitationWorker.assigned_area.ilike(f"%{area_name}%")
        ).offset(skip).limit(limit).all()

    def get_active_workers(self) -> List[SanitationWorker]:
        """Get all active workers"""
        return self.get_by_status(WorkerStatus.ACTIVE)

    def get_workers_on_leave(self) -> List[SanitationWorker]:
        """Get workers on leave"""
        return self.get_by_status(WorkerStatus.ON_LEAVE)

    def update_status(self, worker_id: int, status: WorkerStatus) -> Optional[SanitationWorker]:
        """Update worker status"""
        return self.update(worker_id, status=status)

    def get_worker_count_by_shift(self) -> dict:
        """Get count of workers by shift"""
        result = {}
        for shift in ShiftType:
            count = self.db.query(SanitationWorker).filter(
                SanitationWorker.shift_type == shift
            ).count()
            result[shift.value] = count
        return result

    def get_worker_count_by_status(self) -> dict:
        """Get count of workers by status"""
        result = {}
        for status in WorkerStatus:
            count = self.db.query(SanitationWorker).filter(
                SanitationWorker.status == status
            ).count()
            result[status.value] = count
        return result