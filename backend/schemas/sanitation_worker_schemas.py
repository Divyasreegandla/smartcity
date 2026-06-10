from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class ShiftType(str, Enum):
    MORNING = "morning"
    EVENING = "evening"
    NIGHT = "night"

class WorkerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ON_LEAVE = "on_leave"

class SanitationWorkerCreate(BaseModel):
    employee_code: str = Field(..., min_length=2, max_length=20)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    assigned_area: str = Field(..., min_length=2, max_length=100)
    shift_type: ShiftType
    status: WorkerStatus = WorkerStatus.ACTIVE

    @validator('employee_code')
    def validate_employee_code(cls, v):
        return v.upper()

class SanitationWorkerUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    assigned_area: Optional[str] = Field(None, min_length=2, max_length=100)
    shift_type: Optional[ShiftType] = None
    status: Optional[WorkerStatus] = None

class SanitationWorkerResponse(BaseModel):
    id: int
    employee_code: str
    full_name: str
    phone: str
    assigned_area: str
    shift_type: ShiftType
    status: WorkerStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True