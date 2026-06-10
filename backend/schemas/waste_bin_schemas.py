from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class BinStatus(str, Enum):
    EMPTY = "empty"
    PARTIAL = "partial"
    FULL = "full"
    OVERFLOWING = "overflowing"
    MAINTENANCE = "maintenance"

class WasteBinCreate(BaseModel):
    bin_code: str = Field(..., min_length=2, max_length=20)
    location: str = Field(..., min_length=5)
    bin_capacity: float = Field(..., gt=0)
    fill_level: float = Field(0, ge=0, le=100)
    status: BinStatus = BinStatus.EMPTY
    installed_date: datetime

    @validator('bin_code')
    def validate_bin_code(cls, v):
        return v.upper()

    @validator('fill_level')
    def validate_fill_level(cls, v, values):
        if 'bin_capacity' in values and v > 100:
            raise ValueError('Fill level cannot exceed 100%')
        return v

class WasteBinUpdate(BaseModel):
    location: Optional[str] = Field(None, min_length=5)
    fill_level: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[BinStatus] = None

class WasteBinResponse(BaseModel):
    id: int
    bin_code: str
    location: str
    bin_capacity: float
    fill_level: float
    status: BinStatus
    installed_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    fill_percentage: Optional[float] = None

    class Config:
        from_attributes = True

    def __init__(self, **data):
        super().__init__(**data)
        if self.bin_capacity > 0:
            self.fill_percentage = (self.fill_level / self.bin_capacity) * 100