from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, timezone
from enum import Enum

class BillStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"

class BillCreate(BaseModel):
    citizen_id: int
    category_id: int
    bill_month: int = Field(..., ge=1, le=12)
    bill_year: int = Field(..., ge=2020, le=2100)
    due_date: datetime
    amount: float = Field(..., gt=0)
    late_fee: float = Field(0, ge=0)

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be greater than 0')
        return v

    @validator('due_date')
    def validate_due_date(cls, v):
        # Make due_date timezone-aware if it's naive
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        if v < now:
            raise ValueError('Due date cannot be in the past')
        return v

class BillUpdate(BaseModel):
    bill_status: Optional[BillStatus] = None

class BillResponse(BaseModel):
    id: int
    bill_number: str
    citizen_id: int
    category_id: int
    category_name: Optional[str] = None
    bill_month: int
    bill_year: int
    due_date: datetime
    amount: float
    late_fee: float
    total_amount: float
    bill_status: BillStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True