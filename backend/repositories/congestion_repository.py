from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from models.congestion_reports import CongestionReport, CongestionLevel
from .base_repository import BaseRepository


class CongestionRepository(BaseRepository[CongestionReport]):
    def __init__(self, db: Session):
        super().__init__(CongestionReport, db)

    def get_by_area(self, area_name: str, skip: int = 0, limit: int = 100) -> List[CongestionReport]:
        return self.db.query(CongestionReport).filter(
            CongestionReport.area_name.ilike(f"%{area_name}%")
        ).order_by(CongestionReport.report_time.desc()).offset(skip).limit(limit).all()

    def get_latest_by_area(self, area_name: str) -> Optional[CongestionReport]:
        return self.db.query(CongestionReport).filter(
            CongestionReport.area_name.ilike(f"%{area_name}%")
        ).order_by(CongestionReport.report_time.desc()).first()

    def get_high_congestion_areas(self) -> List[dict]:
        latest_reports = self.db.query(
            CongestionReport.area_name,
            CongestionReport.congestion_level,
            CongestionReport.vehicle_count,
            CongestionReport.report_time
        ).filter(
            CongestionReport.congestion_level.in_([CongestionLevel.HIGH, CongestionLevel.SEVERE])
        ).order_by(CongestionReport.report_time.desc()).limit(10).all()
        return [{"area": r[0], "level": r[1].value, "vehicles": r[2], "time": r[3]} for r in latest_reports]

    def get_today_reports(self) -> List[CongestionReport]:
        today = date.today()
        return self.db.query(CongestionReport).filter(
            CongestionReport.report_time >= today
        ).all()