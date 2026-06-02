from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class ComplaintPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplaintStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

COMPLAINT_TYPES = [
    "road_damage",
    "street_light_issue", 
    "water_leakage",
    "garbage_collection",
    "drainage_blockage",
    "public_property_damage",
    "other"
]

class ComplaintCreate(BaseModel):
    complaint_type: str
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    location: str = Field(..., min_length=5)
    priority: ComplaintPriority = ComplaintPriority.MEDIUM

    @validator('complaint_type')
    def validate_type(cls, v):
        if v not in COMPLAINT_TYPES:
            raise ValueError(f'Invalid type. Choose from: {", ".join(COMPLAINT_TYPES)}')
        return v

class ComplaintUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    location: Optional[str] = Field(None, min_length=5)
    priority: Optional[ComplaintPriority] = None

class ComplaintStatusUpdate(BaseModel):
    status: ComplaintStatus
    remarks: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    complaint_number: str
    citizen_id: int
    citizen_name: Optional[str] = None
    complaint_type: str
    title: str
    description: str
    location: str
    priority: ComplaintPriority
    status: ComplaintStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ADD THIS MISSING CLASS
class ComplaintStatusHistoryResponse(BaseModel):
    """Schema for complaint status history response"""
    id: int
    old_status: str
    new_status: str
    remarks: Optional[str]
    updated_by: str
    updated_at: datetime

    class Config:
        from_attributes = True


class ComplaintAttachmentResponse(BaseModel):
    id: int
    complaint_id: int
    file_name: str
    file_path: str
    file_size: int
    uploaded_at: datetime

    class Config:
        from_attributes = True