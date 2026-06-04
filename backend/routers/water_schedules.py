from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from models.water_supply_schedules import WaterSupplySchedule, SupplyStatus
from models.water_zones import WaterZone
from schemas.water_schedule_schemas import WaterScheduleCreate, WaterScheduleUpdate, WaterScheduleResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/water-schedules", tags=["Supply Schedule"])

@router.post("/", response_model=WaterScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_schedule(
    schedule_data: WaterScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create water supply schedule (Admin only)"""
    zone = db.query(WaterZone).filter(WaterZone.id == schedule_data.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    db_schedule = WaterSupplySchedule(**schedule_data.model_dump())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    
    result = db_schedule.__dict__
    result["zone_name"] = zone.zone_name
    return result

@router.get("/", response_model=List[WaterScheduleResponse])
def get_schedules(
    skip: int = 0,
    limit: int = 100,
    zone_id: Optional[int] = None,
    supply_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water supply schedules"""
    query = db.query(WaterSupplySchedule)
    if zone_id:
        query = query.filter(WaterSupplySchedule.zone_id == zone_id)
    if supply_date:
        query = query.filter(WaterSupplySchedule.supply_date == supply_date)
    
    schedules = query.offset(skip).limit(limit).all()
    
    result = []
    for schedule in schedules:
        zone = db.query(WaterZone).filter(WaterZone.id == schedule.zone_id).first()
        result.append({
            **schedule.__dict__,
            "zone_name": zone.zone_name if zone else None
        })
    return result

@router.put("/{schedule_id}", response_model=WaterScheduleResponse)
def update_schedule(
    schedule_id: int,
    schedule_data: WaterScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update water supply schedule (Admin only)"""
    schedule = db.query(WaterSupplySchedule).filter(WaterSupplySchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    update_data = schedule_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(schedule, field, value)
    
    db.commit()
    db.refresh(schedule)
    
    zone = db.query(WaterZone).filter(WaterZone.id == schedule.zone_id).first()
    return {**schedule.__dict__, "zone_name": zone.zone_name if zone else None}