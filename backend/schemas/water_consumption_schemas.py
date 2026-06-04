from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class WaterConsumptionCreate(BaseModel):
    zone_id: int
    consumption_date: datetime
    total_liters_consumed: float = Field(..., gt=0)

class WaterConsumptionResponse(BaseModel):
    id: int
    zone_id: int
    zone_name: Optional[str] = None
    consumption_date: datetime
    total_liters_consumed: float
    created_at: datetime

    class Config:
        from_attributes = True