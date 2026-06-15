from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from models.road_maintenance import RoadMaintenance, RoadMaintenanceStatus, RoadMaintenanceType
from .base_repository import BaseRepository


class RoadMaintenanceRepository(BaseRepository[RoadMaintenance]):
    def __init__(self, db: Session):
        super().__init__(RoadMaintenance, db)

    def get_by_status(self, status: RoadMaintenanceStatus, skip: int = 0, limit: int = 100) -> List[RoadMaintenance]:
        return self.db.query(RoadMaintenance).filter(
            RoadMaintenance.status == status
        ).offset(skip).limit(limit).all()

    def get_by_area(self, area_name: str, skip: int = 0, limit: int = 100) -> List[RoadMaintenance]:
        return self.db.query(RoadMaintenance).filter(
            RoadMaintenance.area_name.ilike(f"%{area_name}%")
        ).offset(skip).limit(limit).all()

    def get_active_maintenance(self) -> List[RoadMaintenance]:
        return self.db.query(RoadMaintenance).filter(
            RoadMaintenance.status.in_([RoadMaintenanceStatus.PLANNED, RoadMaintenanceStatus.IN_PROGRESS])
        ).all()

    def update_status(self, maintenance_id: int, status: RoadMaintenanceStatus) -> Optional[RoadMaintenance]:
        return self.update(maintenance_id, status=status)

    def get_statistics(self) -> dict:
        total = self.count()
        planned = self.db.query(RoadMaintenance).filter(RoadMaintenance.status == RoadMaintenanceStatus.PLANNED).count()
        in_progress = self.db.query(RoadMaintenance).filter(RoadMaintenance.status == RoadMaintenanceStatus.IN_PROGRESS).count()
        completed = self.db.query(RoadMaintenance).filter(RoadMaintenance.status == RoadMaintenanceStatus.COMPLETED).count()
        return {"total": total, "planned": planned, "in_progress": in_progress, "completed": completed}