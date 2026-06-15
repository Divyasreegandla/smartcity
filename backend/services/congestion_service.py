from sqlalchemy.orm import Session
from typing import List, Optional
from repositories.congestion_repository import CongestionRepository
from schemas.congestion_schemas import CongestionReportCreate


class CongestionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CongestionRepository(db)

    def create_report(self, data: CongestionReportCreate):
        return self.repo.create(**data.model_dump())

    def get_all_reports(self, skip: int = 0, limit: int = 100):
        return self.repo.get_all(skip=skip, limit=limit)

    def get_area_congestion(self, area_name: str):
        return self.repo.get_latest_by_area(area_name)

    def get_high_congestion_areas(self):
        return self.repo.get_high_congestion_areas()

    def get_today_reports(self):
        return self.repo.get_today_reports()