from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class IncidentType(str, Enum):
    ACCIDENT = "accident"
    VEHICLE_BREAKDOWN = "vehicle_breakdown"
    ROAD_CLOSURE = "road_closure"
    PROTEST = "protest"
    CONSTRUCTION = "construction"
    OTHER = "other"


class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    REPORTED = "reported"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


class TrafficIncidentCreate(BaseModel):
    incident_type: IncidentType
    location: str = Field(..., min_length=5)
    description: str = Field(..., min_length=10)
    severity: IncidentSeverity = IncidentSeverity.MEDIUM
    incident_time: datetime

    @validator('description')
    def validate_description(cls, v):
        if not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()


class TrafficIncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    severity: Optional[IncidentSeverity] = None
    description: Optional[str] = Field(None, min_length=10)


class TrafficIncidentResponse(BaseModel):
    id: int
    incident_number: str
    incident_type: IncidentType
    location: str
    description: str
    severity: IncidentSeverity
    reported_by: int
    incident_time: datetime
    status: IncidentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True