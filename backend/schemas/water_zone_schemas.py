from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class ZoneStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class WaterZoneCreate(BaseModel):
    zone_code: str = Field(..., min_length=2, max_length=20)
    zone_name: str = Field(..., min_length=2, max_length=100)
    area_name: str = Field(..., min_length=2, max_length=200)
    population: int = Field(0, ge=0)
    status: ZoneStatus = ZoneStatus.ACTIVE

    @validator('zone_code')
    def validate_zone_code(cls, v):
        # Allow letters, numbers, and underscores (no spaces or special chars except underscore)
        import re
        if not re.match(r'^[A-Za-z0-9_]+$', v):
            raise ValueError('Zone code must contain only letters, numbers, and underscores')
        return v.upper()

    @validator('zone_name')
    def validate_zone_name(cls, v):
        if not v.strip():
            raise ValueError('Zone name cannot be empty')
        return v.strip()

class WaterZoneUpdate(BaseModel):
    zone_name: Optional[str] = Field(None, min_length=2, max_length=100)
    area_name: Optional[str] = Field(None, min_length=2, max_length=200)
    population: Optional[int] = Field(None, ge=0)
    status: Optional[ZoneStatus] = None

    @validator('zone_name')
    def validate_zone_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Zone name cannot be empty')
        return v.strip() if v else v

class WaterZoneResponse(BaseModel):
    id: int
    zone_code: str
    zone_name: str
    area_name: str
    population: int
    status: ZoneStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True