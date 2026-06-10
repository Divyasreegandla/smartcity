from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class WasteCollectionCreate(BaseModel):
    route_id: int
    vehicle_id: int
    collection_date: datetime
    collected_weight_kg: float = Field(..., gt=0)
    remarks: Optional[str] = None

class WasteCollectionResponse(BaseModel):
    id: int
    route_id: int
    route_name: Optional[str] = None
    vehicle_id: int
    vehicle_number: Optional[str] = None
    collection_date: datetime
    collected_weight_kg: float
    remarks: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True