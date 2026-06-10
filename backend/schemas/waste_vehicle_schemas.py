from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class VehicleStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"

class VehicleType(str, Enum):
    TRUCK = "truck"
    COMPACTOR = "compactor"
    TIPPER = "tipper"
    DUMPER = "dumper"

class WasteVehicleCreate(BaseModel):
    vehicle_number: str = Field(..., min_length=4, max_length=20)
    vehicle_type: VehicleType
    driver_name: str = Field(..., min_length=2, max_length=100)
    contact_number: str = Field(..., min_length=10, max_length=15)
    status: VehicleStatus = VehicleStatus.ACTIVE

    @validator('vehicle_number')
    def validate_vehicle_number(cls, v):
        v = v.upper()
        return v

class WasteVehicleUpdate(BaseModel):
    driver_name: Optional[str] = Field(None, min_length=2, max_length=100)
    contact_number: Optional[str] = Field(None, min_length=10, max_length=15)
    status: Optional[VehicleStatus] = None

class WasteVehicleResponse(BaseModel):
    id: int
    vehicle_number: str
    vehicle_type: VehicleType
    driver_name: str
    contact_number: str
    status: VehicleStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True