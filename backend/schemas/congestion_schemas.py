from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class CongestionLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    SEVERE = "severe"


class CongestionReportCreate(BaseModel):
    area_name: str = Field(..., min_length=2, max_length=100)
    congestion_level: CongestionLevel
    vehicle_count: int = Field(0, ge=0)


class CongestionReportResponse(BaseModel):
    id: int
    area_name: str
    congestion_level: CongestionLevel
    vehicle_count: int
    report_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True