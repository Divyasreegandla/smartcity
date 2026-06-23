from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class PropertyType(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    INDUSTRIAL = "industrial"
    AGRICULTURAL = "agricultural"

class PropertyTaxCalculationRequest(BaseModel):
    property_value: float = Field(..., gt=0, description="Property value in currency")
    property_type: PropertyType = Field(..., description="Type of property")

class PropertyTaxCalculationResponse(BaseModel):
    property_value: float
    property_type: str
    tax_rate: float
    base_tax: float
    cess: float
    service_charge: float
    total_tax: float

class PropertyTaxBillGenerate(BaseModel):
    citizen_id: int
    property_value: float = Field(..., gt=0)
    property_type: PropertyType
    month: int = Field(..., ge=1, le=12)
    year: int = Field(..., ge=2020, le=2100)
    due_date: Optional[datetime] = None

class PropertyTaxBillResponse(BaseModel):
    id: int
    bill_number: str
    citizen_id: int
    category_id: int
    category_name: str = "Property Tax"
    bill_month: int
    bill_year: int
    due_date: datetime
    amount: float
    late_fee: float
    total_amount: float
    bill_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True