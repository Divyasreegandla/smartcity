from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from services.water_service import WaterService
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
    service = WaterService(db)
    schedule, error = service.create_schedule(schedule_data)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return schedule


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
    service = WaterService(db)
    return service.get_schedules(skip, limit, zone_id, supply_date)


@router.put("/{schedule_id}", response_model=WaterScheduleResponse)
def update_schedule(
    schedule_id: int,
    schedule_data: WaterScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update water supply schedule (Admin only)"""
    service = WaterService(db)
    schedule = service.update_schedule(schedule_id, schedule_data)
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    return schedule