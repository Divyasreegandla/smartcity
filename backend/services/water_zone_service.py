from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from models.water_zones import WaterZone, ZoneStatus
from models.water_supply_schedules import WaterSupplySchedule
from models.water_consumption import WaterConsumption
from models.water_leak_reports import WaterLeakReport
from schemas.water_zone_schemas import WaterZoneCreate, WaterZoneUpdate
from datetime import datetime, timedelta

class WaterZoneService:
    def __init__(self, db: Session):
        self.db = db

    def create_zone(self, zone_data: WaterZoneCreate) -> WaterZone:
        db_zone = WaterZone(**zone_data.model_dump())
        self.db.add(db_zone)
        self.db.commit()
        self.db.refresh(db_zone)
        return db_zone

    def get_all_zones(self, skip: int = 0, limit: int = 100, status: Optional[ZoneStatus] = None) -> List[WaterZone]:
        query = self.db.query(WaterZone)
        if status:
            query = query.filter(WaterZone.status == status)
        return query.offset(skip).limit(limit).all()

    def get_zone_by_id(self, zone_id: int) -> Optional[WaterZone]:
        return self.db.query(WaterZone).filter(WaterZone.id == zone_id).first()

    def update_zone(self, zone_id: int, zone_data: WaterZoneUpdate) -> Optional[WaterZone]:
        zone = self.get_zone_by_id(zone_id)
        if not zone:
            return None
        
        update_data = zone_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(zone, field, value)
        
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def delete_zone(self, zone_id: int) -> bool:
        zone = self.get_zone_by_id(zone_id)
        if not zone:
            return False
        
        self.db.delete(zone)
        self.db.commit()
        return True