from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class ElectricityUsageCreate(BaseModel):
    area_name: str = Field(..., min_length=2, max_length=100)
    usage_date: datetime
    units_consumed: float = Field(..., gt=0)
    peak_load: float = Field(..., gt=0)

    @validator('peak_load')
    def validate_peak_load(cls, v, values):
        if 'units_consumed' in values and v > values['units_consumed'] * 2:
            raise ValueError('Peak load seems unrealistic compared to units consumed')
        return v

class ElectricityUsageResponse(BaseModel):
    id: int
    area_name: str
    usage_date: datetime
    units_consumed: float
    peak_load: float
    recorded_at: datetime

    class Config:
        from_attributes = True