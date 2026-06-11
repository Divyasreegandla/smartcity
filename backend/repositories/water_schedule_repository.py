from typing import Optional, List
from datetime import date, time
from sqlalchemy.orm import Session
from models.water_supply_schedules import WaterSupplySchedule, SupplyStatus
from .base_repository import BaseRepository


class WaterScheduleRepository(BaseRepository[WaterSupplySchedule]):
    def __init__(self, db: Session):
        super().__init__(WaterSupplySchedule, db)

    def get_by_zone_id(self, zone_id: int, skip: int = 0, limit: int = 100) -> List[WaterSupplySchedule]:
        """Get schedules by zone"""
        return self.db.query(WaterSupplySchedule).filter(
            WaterSupplySchedule.zone_id == zone_id
        ).order_by(WaterSupplySchedule.supply_date.desc()).offset(skip).limit(limit).all()

    def get_by_date(self, supply_date: date, zone_id: Optional[int] = None) -> List[WaterSupplySchedule]:
        """Get schedules for a specific date"""
        query = self.db.query(WaterSupplySchedule).filter(
            WaterSupplySchedule.supply_date >= supply_date,
            WaterSupplySchedule.supply_date <= supply_date
        )
        if zone_id:
            query = query.filter(WaterSupplySchedule.zone_id == zone_id)
        return query.all()

    def get_today_schedules(self) -> List[WaterSupplySchedule]:
        """Get today's schedules"""
        today = date.today()
        return self.get_by_date(today)

    def get_active_schedules(self) -> List[WaterSupplySchedule]:
        """Get currently active schedules"""
        today = date.today()
        return self.db.query(WaterSupplySchedule).filter(
            WaterSupplySchedule.supply_date >= today,
            WaterSupplySchedule.supply_status == SupplyStatus.SCHEDULED
        ).all()

    def update_status(self, schedule_id: int, status: SupplyStatus) -> Optional[WaterSupplySchedule]:
        """Update schedule status"""
        return self.update(schedule_id, supply_status=status)