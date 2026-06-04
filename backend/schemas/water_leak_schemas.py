from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class LeakStatus(str, Enum):
    REPORTED = "reported"
    UNDER_REVIEW = "under_review"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class WaterLeakCreate(BaseModel):
    zone_id: int
    location: str = Field(..., min_length=5, max_length=255)
    description: str = Field(..., min_length=10)

class WaterLeakUpdate(BaseModel):
    status: Optional[LeakStatus] = None
    resolved_remarks: Optional[str] = None

class WaterLeakResponse(BaseModel):
    id: int
    zone_id: int
    zone_name: Optional[str] = None
    reported_by: int
    reported_by_name: Optional[str] = None
    location: str
    description: str
    status: LeakStatus
    resolved_remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True