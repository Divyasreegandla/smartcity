from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.road_maintenance_repository import RoadMaintenanceRepository
from schemas.road_maintenance_schemas import RoadMaintenanceCreate, RoadMaintenanceUpdate


class RoadMaintenanceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RoadMaintenanceRepository(db)

    def create_maintenance(self, data: RoadMaintenanceCreate):
        return self.repo.create(**data.model_dump())

    def get_all_maintenance(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            # Convert string status to enum
            from models.road_maintenance import RoadMaintenanceStatus
            status_enum = None
            if status == "planned":
                status_enum = RoadMaintenanceStatus.PLANNED
            elif status == "in_progress":
                status_enum = RoadMaintenanceStatus.IN_PROGRESS
            elif status == "completed":
                status_enum = RoadMaintenanceStatus.COMPLETED
            elif status == "cancelled":
                status_enum = RoadMaintenanceStatus.CANCELLED
            
            if status_enum:
                return self.repo.get_by_status(status_enum, skip, limit)
        return self.repo.get_all(skip=skip, limit=limit)

    def get_maintenance_by_id(self, maintenance_id: int):
        return self.repo.get_by_id(maintenance_id)

    def update_maintenance(self, maintenance_id: int, data: RoadMaintenanceUpdate):
        maintenance = self.repo.get_by_id(maintenance_id)
        if not maintenance:
            return None
        return self.repo.update_from_dict(maintenance_id, data.model_dump(exclude_unset=True))

    def update_status(self, maintenance_id: int, status: str):
        maintenance = self.repo.get_by_id(maintenance_id)
        if not maintenance:
            return None
        
        from models.road_maintenance import RoadMaintenanceStatus
        status_map = {
            "planned": RoadMaintenanceStatus.PLANNED,
            "in_progress": RoadMaintenanceStatus.IN_PROGRESS,
            "completed": RoadMaintenanceStatus.COMPLETED,
            "cancelled": RoadMaintenanceStatus.CANCELLED
        }
        
        status_enum = status_map.get(status)
        if status_enum:
            return self.repo.update_status(maintenance_id, status_enum)
        return None

    def get_active_maintenance(self):
        return self.repo.get_active_maintenance()

    def get_dashboard_stats(self) -> Dict:
        return self.repo.get_statistics()