from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TransformerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    FAULT = "fault"
    MAINTENANCE = "maintenance"

class TransformerCreate(BaseModel):
    transformer_code: str = Field(..., min_length=2, max_length=20)
    substation_id: int
    location: str = Field(..., min_length=5)
    capacity_kva: float = Field(..., gt=0)
    installation_date: datetime
    status: TransformerStatus = TransformerStatus.ACTIVE

    @validator('transformer_code')
    def validate_code(cls, v):
        # Allow letters, numbers, underscores, and hyphens
        import re
        if not re.match(r'^[A-Za-z0-9_-]+$', v):
            raise ValueError('Transformer code must contain only letters, numbers, underscores, and hyphens')
        return v.upper()

class TransformerUpdate(BaseModel):
    location: Optional[str] = Field(None, min_length=5)
    status: Optional[TransformerStatus] = None

class TransformerResponse(BaseModel):
    id: int
    transformer_code: str
    substation_id: int
    substation_name: Optional[str] = None
    location: str
    capacity_kva: float
    installation_date: datetime
    status: TransformerStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True