from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class RouteStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CANCELLED = "cancelled"

class CollectionRouteCreate(BaseModel):
    route_code: str = Field(..., min_length=2, max_length=20)
    route_name: str = Field(..., min_length=2, max_length=100)
    area_name: str = Field(..., min_length=2, max_length=100)
    assigned_vehicle_id: Optional[int] = None
    collection_schedule: str = Field(..., min_length=2)
    status: RouteStatus = RouteStatus.ACTIVE

    @validator('route_code')
    def validate_route_code(cls, v):
        return v.upper()

class CollectionRouteUpdate(BaseModel):
    route_name: Optional[str] = Field(None, min_length=2, max_length=100)
    area_name: Optional[str] = Field(None, min_length=2, max_length=100)
    assigned_vehicle_id: Optional[int] = None
    collection_schedule: Optional[str] = Field(None, min_length=2)
    status: Optional[RouteStatus] = None

class CollectionRouteResponse(BaseModel):
    id: int
    route_code: str
    route_name: str
    area_name: str
    assigned_vehicle_id: Optional[int]
    assigned_vehicle_number: Optional[str] = None
    collection_schedule: str
    status: RouteStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True