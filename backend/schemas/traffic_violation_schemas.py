from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class ViolationType(str, Enum):
    SPEEDING = "speeding"
    RED_LIGHT = "red_light"
    WRONG_WAY = "wrong_way"
    NO_HELMET = "no_helmet"
    NO_SEATBELT = "no_seatbelt"
    ILLEGAL_PARKING = "illegal_parking"
    OTHER = "other"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"


class TrafficViolationCreate(BaseModel):
    vehicle_number: str = Field(..., min_length=4, max_length=20)
    violation_type: ViolationType
    location: str = Field(..., min_length=5)
    fine_amount: float = Field(..., gt=0)
    violation_date: datetime

    @validator('vehicle_number')
    def validate_vehicle_number(cls, v):
        return v.upper()


class TrafficViolationUpdate(BaseModel):
    payment_status: Optional[PaymentStatus] = None


class TrafficViolationResponse(BaseModel):
    id: int
    violation_number: str
    vehicle_number: str
    violation_type: ViolationType
    location: str
    fine_amount: float
    violation_date: datetime
    payment_status: PaymentStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True