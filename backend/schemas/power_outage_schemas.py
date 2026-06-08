from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class OutageStatus(str, Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"

class PowerOutageCreate(BaseModel):
    area_name: str = Field(..., min_length=2, max_length=100)
    outage_reason: str = Field(..., min_length=5)
    outage_start_time: datetime
    status: OutageStatus = OutageStatus.REPORTED

    @validator('outage_reason')
    def validate_reason(cls, v):
        if not v.strip():
            raise ValueError('Outage reason cannot be empty')
        return v.strip()

class PowerOutageUpdate(BaseModel):
    outage_end_time: Optional[datetime] = None
    status: Optional[OutageStatus] = None

class PowerOutageResponse(BaseModel):
    id: int
    outage_number: str
    area_name: str
    outage_reason: str
    outage_start_time: datetime
    outage_end_time: Optional[datetime] = None
    status: OutageStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    duration_hours: Optional[float] = None

    class Config:
        from_attributes = True

    def __init__(self, **data):
        super().__init__(**data)
        if self.outage_end_time and self.outage_start_time:
            duration = (self.outage_end_time - self.outage_start_time).total_seconds() / 3600
            self.duration_hours = round(duration, 2)