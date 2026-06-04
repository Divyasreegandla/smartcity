from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, time
from enum import Enum

class SupplyStatus(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class WaterScheduleCreate(BaseModel):
    zone_id: int
    supply_date: datetime
    start_time: time
    end_time: time
    supply_status: SupplyStatus = SupplyStatus.SCHEDULED

    @validator('end_time')
    def validate_time_range(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('End time must be after start time')
        return v

class WaterScheduleUpdate(BaseModel):
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    supply_status: Optional[SupplyStatus] = None

class WaterScheduleResponse(BaseModel):
    id: int
    zone_id: int
    zone_name: Optional[str] = None
    supply_date: datetime
    start_time: time
    end_time: time
    supply_status: SupplyStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True