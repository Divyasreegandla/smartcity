from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class CitizenProfileBase(BaseModel):
    """
    Base schema for citizen profile
    """
    phone: Optional[str] = Field(None, min_length=10, max_length=15, description="Contact number")
    address: Optional[str] = Field(None, min_length=5, max_length=255, description="Street address")
    city: Optional[str] = Field(None, min_length=2, max_length=50, description="City name")
    state: Optional[str] = Field(None, min_length=2, max_length=50, description="State name")
    pincode: Optional[str] = Field(None, min_length=4, max_length=10, description="Postal code")

    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        if v is not None:
            # Remove any spaces or special characters
            v = ''.join(filter(str.isdigit, v))
            if len(v) < 10:
                raise ValueError('Phone number must be at least 10 digits')
            if len(v) > 15:
                raise ValueError('Phone number too long (max 15 digits)')
        return v

    @validator('pincode')
    def validate_pincode(cls, v):
        """Validate pincode format"""
        if v is not None and not v.isdigit():
            raise ValueError('Pincode must contain only digits')
        return v

class CitizenProfileCreate(CitizenProfileBase):
    """
    Schema for creating a citizen profile
    """
    user_id: int
    phone: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=50)
    state: str = Field(..., min_length=2, max_length=50)
    pincode: str = Field(..., min_length=4, max_length=10)

class CitizenProfileUpdate(BaseModel):
    """
    Schema for updating a citizen profile (all fields optional)
    """
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    address: Optional[str] = Field(None, min_length=5, max_length=255)
    city: Optional[str] = Field(None, min_length=2, max_length=50)
    state: Optional[str] = Field(None, min_length=2, max_length=50)
    pincode: Optional[str] = Field(None, min_length=4, max_length=10)

    @validator('phone')
    def validate_phone(cls, v):
        if v is not None:
            v = ''.join(filter(str.isdigit, v))
            if len(v) < 10:
                raise ValueError('Phone number must be at least 10 digits')
        return v

class CitizenProfileResponse(BaseModel):
    """
    Schema for citizen profile response (allows empty strings for new profiles)
    """
    id: int
    user_id: int
    phone: str = ""  # Allow empty string
    address: str = ""  # Allow empty string
    city: str = ""  # Allow empty string
    state: str = ""  # Allow empty string
    pincode: str = ""  # Allow empty string
    created_at: datetime

    class Config:
        from_attributes = True

class CitizenWithUserResponse(CitizenProfileResponse):
    """
    Schema for citizen profile with user details
    """
    user: dict