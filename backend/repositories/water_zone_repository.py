from typing import Optional, List
from sqlalchemy.orm import Session
from models.water_zones import WaterZone, ZoneStatus
from .base_repository import BaseRepository


class WaterZoneRepository(BaseRepository[WaterZone]):
    def __init__(self, db: Session):
        super().__init__(WaterZone, db)

    def get_by_code(self, zone_code: str) -> Optional[WaterZone]:
        """Get zone by code"""
        return self.db.query(WaterZone).filter(WaterZone.zone_code == zone_code).first()

    def get_by_name(self, zone_name: str) -> Optional[WaterZone]:
        """Get zone by name"""
        return self.db.query(WaterZone).filter(WaterZone.zone_name == zone_name).first()

    def get_active_zones(self) -> List[WaterZone]:
        """Get all active zones"""
        return self.db.query(WaterZone).filter(WaterZone.status == ZoneStatus.ACTIVE).all()

    def get_by_status(self, status: ZoneStatus, skip: int = 0, limit: int = 100) -> List[WaterZone]:
        """Get zones by status"""
        return self.db.query(WaterZone).filter(WaterZone.status == status).offset(skip).limit(limit).all()