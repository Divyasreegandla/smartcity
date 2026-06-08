from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class MaintenanceType(str, Enum):
    ROUTINE = "routine"
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    URGENT = "urgent"

class MaintenanceCreate(BaseModel):
    transformer_id: int
    maintenance_date: datetime
    maintenance_type: MaintenanceType = MaintenanceType.ROUTINE
    maintenance_cost: float = Field(0, ge=0)
    technician_name: Optional[str] = Field(None, max_length=100)
    remarks: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    maintenance_cost: Optional[float] = Field(None, ge=0)
    technician_name: Optional[str] = Field(None, max_length=100)
    remarks: Optional[str] = None

class MaintenanceResponse(BaseModel):
    id: int
    transformer_id: int
    transformer_code: Optional[str] = None
    maintenance_date: datetime
    maintenance_type: MaintenanceType
    maintenance_cost: float
    technician_name: Optional[str]
    remarks: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True