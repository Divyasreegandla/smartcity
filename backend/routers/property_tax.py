from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database.database import get_db
from services.property_tax_service import PropertyTaxService
from schemas.property_tax_schemas import (
    PropertyTaxCalculationRequest,
    PropertyTaxCalculationResponse,
    PropertyTaxBillGenerate,
    PropertyTaxBillResponse
)
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/property-tax", tags=["Property Tax"])

@router.post("/calculate", response_model=PropertyTaxCalculationResponse)
def calculate_tax(
    data: PropertyTaxCalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate property tax based on property value and type"""
    service = PropertyTaxService(db)
    return service.calculate_property_tax(data.property_value, data.property_type)

@router.post("/generate-bill", response_model=PropertyTaxBillResponse)
def generate_property_tax_bill(
    data: PropertyTaxBillGenerate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Generate property tax bill (Admin only)"""
    service = PropertyTaxService(db)
    bill, error = service.generate_property_tax_bill(
        citizen_id=data.citizen_id,
        property_value=data.property_value,
        property_type=data.property_type,
        month=data.month,
        year=data.year,
        due_date=data.due_date
    )
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return bill

@router.get("/my-bills", response_model=List[PropertyTaxBillResponse])
def get_my_property_tax_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all property tax bills for current user"""
    service = PropertyTaxService(db)
    return service.get_property_tax_bills(current_user.id)

@router.get("/all", response_model=List[PropertyTaxBillResponse])
def get_all_property_tax_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all property tax bills (Admin only)"""
    service = PropertyTaxService(db)
    bills = service.bill_repo.get_all()
    return [b for b in bills if b.category_id == 3]