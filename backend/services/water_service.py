# services/water_service.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import date, datetime
from repositories import (
    WaterZoneRepository,
    WaterTankRepository,
    WaterConsumptionRepository,
    WaterLeakRepository,
    WaterScheduleRepository
)
from schemas.water_zone_schemas import WaterZoneCreate, WaterZoneUpdate
from schemas.water_tank_schemas import WaterTankCreate, WaterTankUpdate
from schemas.water_consumption_schemas import WaterConsumptionCreate
from schemas.water_leak_schemas import WaterLeakCreate, WaterLeakUpdate
from schemas.water_schedule_schemas import WaterScheduleCreate, WaterScheduleUpdate


class WaterService:
    def __init__(self, db: Session):
        self.db = db
        self.zone_repo = WaterZoneRepository(db)
        self.tank_repo = WaterTankRepository(db)
        self.consumption_repo = WaterConsumptionRepository(db)
        self.leak_repo = WaterLeakRepository(db)
        self.schedule_repo = WaterScheduleRepository(db)

    # Zone methods
    def create_zone(self, zone_data: WaterZoneCreate):
        existing = self.zone_repo.get_by_code(zone_data.zone_code)
        if existing:
            return None, "Zone code already exists"
        existing_name = self.zone_repo.get_by_name(zone_data.zone_name)
        if existing_name:
            return None, "Zone name already exists"
        zone = self.zone_repo.create(**zone_data.model_dump())
        return zone, None

    def get_all_zones(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.zone_repo.get_by_status(status, skip, limit)
        return self.zone_repo.get_all(skip=skip, limit=limit)

    def get_zone_by_id(self, zone_id: int):
        return self.zone_repo.get_by_id(zone_id)

    def update_zone(self, zone_id: int, zone_data: WaterZoneUpdate):
        return self.zone_repo.update_from_dict(zone_id, zone_data.model_dump(exclude_unset=True))

    def delete_zone(self, zone_id: int) -> bool:
        return self.zone_repo.delete(zone_id)

    # Tank methods
    def create_tank(self, tank_data: WaterTankCreate):
        return self.tank_repo.create(**tank_data.model_dump())

    def get_all_tanks(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.tank_repo.get_by_status(status, skip, limit)
        return self.tank_repo.get_all(skip=skip, limit=limit)

    def get_tank_by_id(self, tank_id: int):
        return self.tank_repo.get_by_id(tank_id)

    def update_tank(self, tank_id: int, tank_data: WaterTankUpdate):
        update_data = tank_data.model_dump(exclude_unset=True)
        if 'current_level' in update_data:
            return self.tank_repo.update_level(tank_id, update_data['current_level'])
        return self.tank_repo.update_from_dict(tank_id, update_data)

    def delete_tank(self, tank_id: int) -> bool:
        return self.tank_repo.delete(tank_id)

    # Consumption methods
    def add_consumption(self, consumption_data: WaterConsumptionCreate):
        zone = self.zone_repo.get_by_id(consumption_data.zone_id)
        if not zone:
            return None, "Zone not found"
        consumption = self.consumption_repo.create(**consumption_data.model_dump())
        return consumption, None

    def get_consumption_records(self, skip: int = 0, limit: int = 100, zone_id: int = None,
                                start_date: date = None, end_date: date = None):
        if zone_id:
            return self.consumption_repo.get_by_zone_id(zone_id, skip, limit)
        if start_date and end_date:
            return self.consumption_repo.get_by_date_range(start_date, end_date)
        return self.consumption_repo.get_all(skip=skip, limit=limit)

    def get_zone_consumption_summary(self, zone_id: int, start_date: date = None, end_date: date = None):
        zone = self.zone_repo.get_by_id(zone_id)
        if not zone:
            return None
        
        records = self.consumption_repo.get_by_date_range(start_date or date.min, end_date or date.today(), zone_id)
        total = sum(r.total_liters_consumed for r in records)
        
        return {
            "zone_id": zone_id,
            "zone_name": zone.zone_name,
            "zone_code": zone.zone_code,
            "total_records": len(records),
            "total_consumption_liters": total,
            "average_consumption_liters": total / len(records) if records else 0
        }

    # Leak methods
    def report_leak(self, leak_data: WaterLeakCreate, reported_by: int):
        zone = self.zone_repo.get_by_id(leak_data.zone_id)
        if not zone:
            return None, "Zone not found"
        
        leak = self.leak_repo.create(
            zone_id=leak_data.zone_id,
            reported_by=reported_by,
            location=leak_data.location,
            description=leak_data.description
        )
        return leak, None

    def get_leak_reports(self, skip: int = 0, limit: int = 100, zone_id: int = None,
                         status: str = None, reported_by: int = None):
        if zone_id:
            return self.leak_repo.get_by_zone_id(zone_id, skip, limit)
        if status:
            return self.leak_repo.get_by_status(status, skip, limit)
        if reported_by:
            return self.leak_repo.get_by_reporter(reported_by, skip, limit)
        return self.leak_repo.get_all(skip=skip, limit=limit)

    def update_leak_report(self, report_id: int, leak_data: WaterLeakUpdate):
        return self.leak_repo.update_status(
            report_id,
            leak_data.status,
            leak_data.resolved_remarks
        )

    # Schedule methods
    def create_schedule(self, schedule_data: WaterScheduleCreate):
        zone = self.zone_repo.get_by_id(schedule_data.zone_id)
        if not zone:
            return None, "Zone not found"
        schedule = self.schedule_repo.create(**schedule_data.model_dump())
        return schedule, None

    def get_schedules(self, skip: int = 0, limit: int = 100, zone_id: int = None, supply_date: date = None):
        if zone_id:
            return self.schedule_repo.get_by_zone_id(zone_id, skip, limit)
        if supply_date:
            return self.schedule_repo.get_by_date(supply_date)
        return self.schedule_repo.get_all(skip=skip, limit=limit)

    def update_schedule(self, schedule_id: int, schedule_data: WaterScheduleUpdate):
        return self.schedule_repo.update_from_dict(schedule_id, schedule_data.model_dump(exclude_unset=True))

    # Dashboard methods
    def get_dashboard_stats(self):
        total_zones = self.zone_repo.count()
        active_zones = len(self.zone_repo.get_active_zones())
        total_tanks = self.tank_repo.count()
        pending_leaks = self.leak_repo.get_pending_count()
        today_consumption = self.consumption_repo.get_daily_total(date.today())
        
        return {
            "total_water_zones": total_zones,
            "active_water_zones": active_zones,
            "total_water_tanks": total_tanks,
            "pending_leakage_reports": pending_leaks,
            "total_consumption_today_liters": today_consumption
        }

    def get_weekly_trend(self):
        return self.consumption_repo.get_weekly_trend()

    def get_leakage_summary(self):
        total = self.leak_repo.count()
        resolution_rate = self.leak_repo.get_resolution_rate()
        
        return {
            "total_reports": total,
            "resolution_rate": round(resolution_rate, 1)
        }