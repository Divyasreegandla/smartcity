from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database.database import get_db
from models.power_outages import PowerOutage, OutageStatus
from schemas.power_outage_schemas import PowerOutageCreate, PowerOutageUpdate, PowerOutageResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/power-outages", tags=["Power Outages"])

def generate_outage_number_db(db: Session) -> str:
    today = datetime.now().strftime("%Y%m%d")
    count = db.query(PowerOutage).filter(
        PowerOutage.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
    ).count()
    return f"OUT-{today}-{str(count + 1).zfill(4)}"

@router.post("/", response_model=PowerOutageResponse, status_code=status.HTTP_201_CREATED)
def report_outage(
    data: PowerOutageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Report a power outage (Citizens & Admins)"""
    outage_number = generate_outage_number_db(db)
    
    db_outage = PowerOutage(
        outage_number=outage_number,
        area_name=data.area_name,
        outage_reason=data.outage_reason,
        outage_start_time=data.outage_start_time,
        status=data.status
    )
    db.add(db_outage)
    db.commit()
    db.refresh(db_outage)
    return db_outage

@router.get("/", response_model=List[PowerOutageResponse])
def get_outages(
    skip: int = 0,
    limit: int = 100,
    status: Optional[OutageStatus] = None,
    area_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get power outages with filters"""
    query = db.query(PowerOutage)
    if status:
        query = query.filter(PowerOutage.status == status)
    if area_name:
        query = query.filter(PowerOutage.area_name.ilike(f"%{area_name}%"))
    
    return query.order_by(PowerOutage.outage_start_time.desc()).offset(skip).limit(limit).all()

@router.get("/{outage_id}", response_model=PowerOutageResponse)
def get_outage(
    outage_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get power outage by ID"""
    outage = db.query(PowerOutage).filter(PowerOutage.id == outage_id).first()
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
    outage = db.query(PowerOutage).filter(PowerOutage.id == outage_id).first()
    if not outage:
        raise HTTPException(status_code=404, detail="Outage not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(outage, field, value)
    
    if data.status == OutageStatus.RESOLVED and not outage.outage_end_time:
        outage.outage_end_time = datetime.now()
    
    db.commit()
    db.refresh(outage)
    return outage

# ADD THIS MISSING ENDPOINT
@router.get("/active/current")
def get_current_active_outages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get currently active power outages"""
    outages = db.query(PowerOutage).filter(
        PowerOutage.status.in_([OutageStatus.REPORTED, OutageStatus.IN_PROGRESS])
    ).all()
    
    return {
        "active_outages": len(outages),
        "outages": outages
    }