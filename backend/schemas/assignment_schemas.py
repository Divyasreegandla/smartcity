from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintAssign(BaseModel):
    complaint_id: int
    department_id: int
    assigned_to: Optional[int] = None  # Can be null
    remarks: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    complaint_id: int
    complaint_number: Optional[str] = None
    department_id: int
    department_name: str
    assigned_to: Optional[int] = None
    assigned_to_name: Optional[str] = None
    assigned_by: Optional[int] = None
    assigned_by_name: Optional[str] = None
    assigned_at: datetime
    remarks: Optional[str] = None

    class Config:
        from_attributes = True