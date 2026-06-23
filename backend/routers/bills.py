from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.bill_service import BillService
from schemas.bill_schemas import BillCreate, BillUpdate, BillResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/bills", tags=["Utility Bills"])

@router.post("/generate", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
def generate_bill(
    data: BillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Generate a new bill (Admin only)"""
    service = BillService(db)
    bill, error = service.generate_bill(data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return bill

@router.get("/", response_model=List[BillResponse])
def get_bills(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all bills for current user (citizen sees own, admin sees all)"""
    service = BillService(db)
    
    # If admin, get all bills
    if current_user.role == "admin":
        bills = service.bill_repo.get_all(skip=skip, limit=limit)
        return service._enrich_bills(bills)
    
    # Citizen sees their own bills
    return service.get_citizen_bills(current_user.id, skip, limit)

@router.get("/pending", response_model=List[BillResponse])
def get_pending_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pending bills for current user"""
    service = BillService(db)
    
    # If admin, get all pending bills
    if current_user.role == "admin":
        bills = service.bill_repo.get_all()
        pending_bills = [b for b in bills if b.bill_status in ["pending", "overdue"]]
        return service._enrich_bills(pending_bills)
    
    return service.get_pending_bills(current_user.id)

@router.get("/history", response_model=List[BillResponse])
def get_bill_history(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paid bill history"""
    service = BillService(db)
    
    # If admin, get all paid bills
    if current_user.role == "admin":
        bills = service.bill_repo.get_all()
        paid_bills = [b for b in bills if b.bill_status == "paid"]
        return service._enrich_bills(paid_bills)
    
    return service.get_bill_history(current_user.id)

@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get bill by ID"""
    service = BillService(db)
    bill = service.bill_repo.get_by_id(bill_id)
    
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Check access: admin can view any, citizen only their own
    if current_user.role != "admin" and bill.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    category = service.category_repo.get_by_id(bill.category_id)
    return {
        **bill.__dict__,
        "category_name": category.category_name if category else None
    }

@router.put("/{bill_id}", response_model=BillResponse)
def update_bill(
    bill_id: int,
    data: BillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update bill status - Admin can update any bill"""
    service = BillService(db)
    
    # ✅ Pass user_role to service
    bill = service.update_bill_status(
        bill_id, 
        data.bill_status, 
        current_user.id, 
        current_user.role
    )
    
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found or access denied")
    return bill