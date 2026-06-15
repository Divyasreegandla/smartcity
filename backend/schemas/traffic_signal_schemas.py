from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class SignalStatus(str, Enum):
    RED = "red"
    YELLOW = "yellow"
    GREEN = "green"
    FLASHING = "flashing"
    OFF = "off"
    MAINTENANCE = "maintenance"


class TrafficSignalCreate(BaseModel):
    signal_code: str = Field(..., min_length=2, max_length=20)
    junction_name: str = Field(..., min_length=2, max_length=100)
    location: str = Field(..., min_length=5)
    signal_status: SignalStatus = SignalStatus.RED
    installation_date: datetime

    @validator('signal_code')
    def validate_signal_code(cls, v):
        return v.upper()


class TrafficSignalUpdate(BaseModel):
    junction_name: Optional[str] = Field(None, min_length=2, max_length=100)
    location: Optional[str] = Field(None, min_length=5)
    signal_status: Optional[SignalStatus] = None


class TrafficSignalResponse(BaseModel):
    id: int
    signal_code: str
    junction_name: str
    location: str
    signal_status: SignalStatus
    installation_date: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True