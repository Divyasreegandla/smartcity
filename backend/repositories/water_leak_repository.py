from typing import Optional, List
from sqlalchemy.orm import Session
from models.water_leak_reports import WaterLeakReport, LeakStatus
from .base_repository import BaseRepository


class WaterLeakRepository(BaseRepository[WaterLeakReport]):
    def __init__(self, db: Session):
        super().__init__(WaterLeakReport, db)

    def get_by_zone_id(self, zone_id: int, skip: int = 0, limit: int = 100) -> List[WaterLeakReport]:
        """Get leaks by zone"""
        return self.db.query(WaterLeakReport).filter(
            WaterLeakReport.zone_id == zone_id
        ).order_by(WaterLeakReport.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_status(self, status: LeakStatus, skip: int = 0, limit: int = 100) -> List[WaterLeakReport]:
        """Get leaks by status"""
        return self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == status
        ).order_by(WaterLeakReport.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_reporter(self, reported_by: int, skip: int = 0, limit: int = 100) -> List[WaterLeakReport]:
        """Get leaks reported by a user"""
        return self.db.query(WaterLeakReport).filter(
            WaterLeakReport.reported_by == reported_by
        ).order_by(WaterLeakReport.created_at.desc()).offset(skip).limit(limit).all()

    def update_status(self, report_id: int, status: LeakStatus, resolved_remarks: str = None) -> Optional[WaterLeakReport]:
        """Update leak report status"""
        return self.update(report_id, status=status, resolved_remarks=resolved_remarks)

    def get_pending_count(self) -> int:
        """Get count of pending leaks (reported and under_review)"""
        return self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status.in_([LeakStatus.REPORTED, LeakStatus.UNDER_REVIEW])
        ).count()

    def get_resolution_rate(self) -> float:
        """Get resolution rate percentage"""
        total = self.db.query(WaterLeakReport).count()
        if total == 0:
            return 0
        resolved = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.RESOLVED
        ).count()
        return (resolved / total) * 100