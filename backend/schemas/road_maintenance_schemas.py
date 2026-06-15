from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class RoadMaintenanceType(str, Enum):
    ROUTINE = "routine"
    REPAIR = "repair"
    RESURFACING = "resurfacing"
    RECONSTRUCTION = "reconstruction"
    EMERGENCY = "emergency"


class RoadMaintenanceStatus(str, Enum):
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RoadMaintenanceCreate(BaseModel):
    road_name: str = Field(..., min_length=2, max_length=200)
    area_name: str = Field(..., min_length=2, max_length=100)
    maintenance_type: RoadMaintenanceType
    start_date: datetime
    expected_completion_date: datetime
    estimated_cost: float = Field(0, ge=0)

    @validator('expected_completion_date')
    def validate_dates(cls, v, values):
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('Expected completion date must be after start date')
        return v


class RoadMaintenanceUpdate(BaseModel):
    status: Optional[RoadMaintenanceStatus] = None
    estimated_cost: Optional[float] = Field(None, ge=0)


class RoadMaintenanceResponse(BaseModel):
    id: int
    road_name: str
    area_name: str
    maintenance_type: RoadMaintenanceType
    start_date: datetime
    expected_completion_date: datetime
    status: RoadMaintenanceStatus
    estimated_cost: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True