from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.power_service import PowerService
from schemas.power_outage_schemas import PowerOutageCreate, PowerOutageUpdate, PowerOutageResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/power-outages", tags=["Power Outages"])


@router.post("/", response_model=PowerOutageResponse, status_code=status.HTTP_201_CREATED)
def report_outage(
    data: PowerOutageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a power outage (Citizens & Admins)"""
    service = PowerService(db)
    outage = service.create_outage(data)
    return outage


@router.get("/", response_model=List[PowerOutageResponse])
def get_outages(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    area_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get power outages with filters"""
    service = PowerService(db)
    return service.get_all_outages(skip, limit, status, area_name)


@router.get("/active/current")
def get_current_active_outages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get currently active power outages"""
    service = PowerService(db)
    outages = service.get_active_outages()
    
    return {
        "active_outages": len(outages),
        "outages": outages
    }


@router.get("/{outage_id}", response_model=PowerOutageResponse)
def get_outage(
    outage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get power outage by ID"""
    service = PowerService(db)
    outage = service.get_outage_by_id(outage_id)
    
    if not outage:
        raise HTTPException(status_code=404, detail="Outage not found")
    
    return outage


@router.put("/{outage_id}", response_model=PowerOutageResponse)
def update_outage(
    outage_id: int,
    data: PowerOutageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update outage status and resolve (Admin only)"""
    service = PowerService(db)
    outage = service.update_outage(outage_id, data)
    
    if not outage:
        raise HTTPException(status_code=404, detail="Outage not found")
    
    return outage