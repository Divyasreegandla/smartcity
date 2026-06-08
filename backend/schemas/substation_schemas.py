from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class SubstationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class SubstationCreate(BaseModel):
    substation_code: str = Field(..., min_length=2, max_length=20)
    substation_name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=5)
    capacity_mw: float = Field(..., gt=0)
    status: SubstationStatus = SubstationStatus.ACTIVE

    @validator('substation_code')
    def validate_code(cls, v):
        # Allow letters, numbers, underscores, and hyphens
        import re
        if not re.match(r'^[A-Za-z0-9_-]+$', v):
            raise ValueError('Substation code must contain only letters, numbers, underscores, and hyphens')
        return v.upper()

class SubstationUpdate(BaseModel):
    substation_name: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=5)
    capacity_mw: Optional[float] = Field(None, gt=0)
    status: Optional[SubstationStatus] = None

class SubstationResponse(BaseModel):
    id: int
    substation_code: str
    substation_name: str
    location: str
    capacity_mw: float
    status: SubstationStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True