from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TankStatus(str, Enum):
    FULL = "full"
    PARTIAL = "partial"
    LOW = "low"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"

class WaterTankCreate(BaseModel):
    tank_name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=2, max_length=200)
    capacity_liters: float = Field(..., gt=0)
    current_level: float = Field(0, ge=0)
    status: TankStatus = TankStatus.PARTIAL

    @validator('current_level')
    def validate_current_level(cls, v, values):
        if 'capacity_liters' in values and v > values['capacity_liters']:
            raise ValueError('Current level cannot exceed capacity')
        return v

class WaterTankUpdate(BaseModel):
    tank_name: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=2, max_length=200)
    current_level: Optional[float] = Field(None, ge=0)
    status: Optional[TankStatus] = None

class WaterTankResponse(BaseModel):
    id: int
    tank_name: str
    location: str
    capacity_liters: float
    current_level: float
    status: TankStatus
    fill_percentage: float = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

    def __init__(self, **data):
        super().__init__(**data)
        if self.capacity_liters > 0:
            self.fill_percentage = (self.current_level / self.capacity_liters) * 100