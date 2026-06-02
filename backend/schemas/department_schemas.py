from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DepartmentCreate(BaseModel):
    department_name: str = Field(..., min_length=2, max_length=100)
    department_head: Optional[str] = Field(None, max_length=100)
    contact_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')

class DepartmentUpdate(BaseModel):
    department_name: Optional[str] = Field(None, min_length=2, max_length=100)
    department_head: Optional[str] = Field(None, max_length=100)
    contact_number: Optional[str] = Field(None, pattern=r'^\+?1?\d{9,15}$')

class DepartmentResponse(BaseModel):
    id: int
    department_name: str
    department_head: Optional[str]
    contact_number: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True