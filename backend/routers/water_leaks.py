from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.water_service import WaterService
from schemas.water_leak_schemas import WaterLeakCreate, WaterLeakUpdate, WaterLeakResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/water-leak-reports", tags=["Leakage"])


@router.post("/", response_model=WaterLeakResponse, status_code=status.HTTP_201_CREATED)
def report_leak(
    leak_data: WaterLeakCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a water leakage (Citizen/Admin)"""
    service = WaterService(db)
    leak, error = service.report_leak(leak_data, current_user.id)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return leak


@router.get("/", response_model=List[WaterLeakResponse])
def get_leak_reports(
    skip: int = 0,
    limit: int = 100,
    zone_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water leak reports"""
    service = WaterService(db)
    reported_by = current_user.id if current_user.role != "admin" else None
    
    return service.get_leak_reports(skip, limit, zone_id, status, reported_by)


@router.put("/{report_id}", response_model=WaterLeakResponse)
def update_leak_report(
    report_id: int,
    leak_data: WaterLeakUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update leak report status (Admin only)"""
    service = WaterService(db)
    report = service.update_leak_report(report_id, leak_data)
    
    if not report:
        raise HTTPException(status_code=404, detail="Leak report not found")
    
    return report