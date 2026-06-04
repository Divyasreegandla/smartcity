from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.water_leak_reports import WaterLeakReport, LeakStatus
from models.water_zones import WaterZone
from models.users import User
from schemas.water_leak_schemas import WaterLeakCreate, WaterLeakUpdate, WaterLeakResponse
from utils.auth_utils import get_current_user, get_current_admin_user

router = APIRouter(prefix="/water-leak-reports", tags=["Leakage"])

@router.post("/", response_model=WaterLeakResponse, status_code=status.HTTP_201_CREATED)
def report_leak(
    leak_data: WaterLeakCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a water leakage (Citizen/Admin)"""
    zone = db.query(WaterZone).filter(WaterZone.id == leak_data.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    db_leak = WaterLeakReport(
        zone_id=leak_data.zone_id,
        reported_by=current_user.id,
        location=leak_data.location,
        description=leak_data.description,
        status=LeakStatus.REPORTED
    )
    db.add(db_leak)
    db.commit()
    db.refresh(db_leak)
    
    return {
        **db_leak.__dict__,
        "zone_name": zone.zone_name,
        "reported_by_name": current_user.full_name
    }

@router.get("/", response_model=List[WaterLeakResponse])
def get_leak_reports(
    skip: int = 0,
    limit: int = 100,
    zone_id: Optional[int] = None,
    status: Optional[LeakStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water leak reports"""
    query = db.query(WaterLeakReport)
    if zone_id:
        query = query.filter(WaterLeakReport.zone_id == zone_id)
    if status:
        query = query.filter(WaterLeakReport.status == status)
    
    # Citizens can only see their own reports
    if current_user.role != "admin":
        query = query.filter(WaterLeakReport.reported_by == current_user.id)
    
    reports = query.offset(skip).limit(limit).all()
    
    result = []
    for report in reports:
        zone = db.query(WaterZone).filter(WaterZone.id == report.zone_id).first()
        reporter = db.query(User).filter(User.id == report.reported_by).first()
        result.append({
            **report.__dict__,
            "zone_name": zone.zone_name if zone else None,
            "reported_by_name": reporter.full_name if reporter else None
        })
    return result

@router.put("/{report_id}", response_model=WaterLeakResponse)
def update_leak_report(
    report_id: int,
    leak_data: WaterLeakUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update leak report status (Admin only)"""
    report = db.query(WaterLeakReport).filter(WaterLeakReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Leak report not found")
    
    update_data = leak_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(report, field, value)
    
    db.commit()
    db.refresh(report)
    
    zone = db.query(WaterZone).filter(WaterZone.id == report.zone_id).first()
    reporter = db.query(User).filter(User.id == report.reported_by).first()
    
    return {
        **report.__dict__,
        "zone_name": zone.zone_name if zone else None,
        "reported_by_name": reporter.full_name if reporter else None
    }