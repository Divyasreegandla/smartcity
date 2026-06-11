# services/power_service.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import date, datetime
from repositories import (
    SubstationRepository,
    TransformerRepository,
    ElectricityUsageRepository,
    PowerOutageRepository,
    MaintenanceRepository
)
from schemas.substation_schemas import SubstationCreate, SubstationUpdate
from schemas.transformer_schemas import TransformerCreate, TransformerUpdate
from schemas.electricity_usage_schemas import ElectricityUsageCreate
from schemas.power_outage_schemas import PowerOutageCreate, PowerOutageUpdate
from schemas.maintenance_schemas import MaintenanceCreate, MaintenanceUpdate


class PowerService:
    def __init__(self, db: Session):
        self.db = db
        self.substation_repo = SubstationRepository(db)
        self.transformer_repo = TransformerRepository(db)
        self.usage_repo = ElectricityUsageRepository(db)
        self.outage_repo = PowerOutageRepository(db)
        self.maintenance_repo = MaintenanceRepository(db)

    # Substation methods
    def create_substation(self, data: SubstationCreate):
        existing = self.substation_repo.get_by_code(data.substation_code)
        if existing:
            return None, "Substation code already exists"
        existing_name = self.substation_repo.get_by_name(data.substation_name)
        if existing_name:
            return None, "Substation name already exists"
        substation = self.substation_repo.create(**data.model_dump())
        return substation, None

    def get_all_substations(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.substation_repo.get_by_status(status, skip, limit)
        return self.substation_repo.get_all(skip=skip, limit=limit)

    def get_substation_by_id(self, substation_id: int):
        return self.substation_repo.get_by_id(substation_id)

    def update_substation(self, substation_id: int, data: SubstationUpdate):
        return self.substation_repo.update_from_dict(substation_id, data.model_dump(exclude_unset=True))

    def delete_substation(self, substation_id: int):
        return self.substation_repo.delete(substation_id), None

    # Transformer methods
    def create_transformer(self, data: TransformerCreate):
        substation = self.substation_repo.get_by_id(data.substation_id)
        if not substation:
            return None, "Substation not found"
        
        existing = self.transformer_repo.get_by_code(data.transformer_code)
        if existing:
            return None, "Transformer code already exists"
        
        transformer = self.transformer_repo.create(**data.model_dump())
        return transformer, None

    def get_all_transformers(self, skip: int = 0, limit: int = 100, 
                            substation_id: int = None, status: str = None):
        if substation_id:
            return self.transformer_repo.get_by_substation_id(substation_id, skip, limit)
        if status:
            return self.transformer_repo.get_by_status(status, skip, limit)
        return self.transformer_repo.get_all(skip=skip, limit=limit)

    def get_transformer_by_id(self, transformer_id: int):
        return self.transformer_repo.get_by_id(transformer_id)

    def update_transformer(self, transformer_id: int, data: TransformerUpdate):
        return self.transformer_repo.update_from_dict(transformer_id, data.model_dump(exclude_unset=True))

    # Electricity Usage methods
    def create_usage_record(self, data: ElectricityUsageCreate):
        return self.usage_repo.create(**data.model_dump())

    def get_usage_records(self, skip: int = 0, limit: int = 100, 
                         area_name: str = None, start_date: date = None, end_date: date = None):
        if area_name:
            return self.usage_repo.get_by_area(area_name, skip, limit)
        if start_date and end_date:
            return self.usage_repo.get_by_date_range(start_date, end_date)
        return self.usage_repo.get_all(skip=skip, limit=limit)

    def get_area_usage_summary(self, area_name: str, days: int = 30):
        return self.usage_repo.get_area_summary(area_name, days)

    # Power Outage methods
    def create_outage(self, data: PowerOutageCreate):
        outage_number = self.outage_repo.generate_outage_number()
        return self.outage_repo.create(
            outage_number=outage_number,
            area_name=data.area_name,
            outage_reason=data.outage_reason,
            outage_start_time=data.outage_start_time,
            status=data.status
        )

    def get_all_outages(self, skip: int = 0, limit: int = 100, 
                       status: str = None, area_name: str = None):
        if status:
            return self.outage_repo.get_by_status(status, skip, limit)
        if area_name:
            return self.outage_repo.get_by_area(area_name, skip, limit)
        return self.outage_repo.get_all(skip=skip, limit=limit)

    def get_outage_by_id(self, outage_id: int):
        return self.outage_repo.get_by_id(outage_id)

    def update_outage(self, outage_id: int, data: PowerOutageUpdate):
        update_data = data.model_dump(exclude_unset=True)
        return self.outage_repo.update(outage_id, **update_data)

    def get_active_outages(self):
        return self.outage_repo.get_active_outages()

    # Maintenance methods
    def create_maintenance(self, data: MaintenanceCreate):
        transformer = self.transformer_repo.get_by_id(data.transformer_id)
        if not transformer:
            return None
        return self.maintenance_repo.create(**data.model_dump())

    def get_maintenance_records(self, skip: int = 0, limit: int = 100,
                               transformer_id: int = None, maintenance_type: str = None):
        if transformer_id:
            return self.maintenance_repo.get_by_transformer_id(transformer_id, skip, limit)
        if maintenance_type:
            return self.maintenance_repo.get_by_type(maintenance_type, skip, limit)
        return self.maintenance_repo.get_all(skip=skip, limit=limit)

    def update_maintenance(self, maintenance_id: int, data: MaintenanceUpdate):
        return self.maintenance_repo.update_from_dict(maintenance_id, data.model_dump(exclude_unset=True))

    # Dashboard methods
    def get_dashboard_stats(self):
        total_substations = self.substation_repo.count()
        active_substations = len(self.substation_repo.get_active_substations())
        total_transformers = self.transformer_repo.count()
        active_transformers = len(self.transformer_repo.get_active_transformers())
        fault_transformers = len(self.transformer_repo.get_faulty_transformers())
        today_consumption = self.usage_repo.get_today_consumption()
        active_outages = len(self.outage_repo.get_active_outages())
        
        return {
            "total_substations": total_substations,
            "active_substations": active_substations,
            "total_transformers": total_transformers,
            "active_transformers": active_transformers,
            "fault_transformers": fault_transformers,
            "today_consumption_kwh": round(today_consumption, 2),
            "active_outages": active_outages
        }

    def get_consumption_trend(self, days: int = 7):
        return {"trend": self.usage_repo.get_weekly_trend()}

    def get_area_ranking(self):
        return {"rankings": self.usage_repo.get_area_ranking()}

    def get_outage_statistics(self, days: int = 30):
        return self.outage_repo.get_statistics(days)