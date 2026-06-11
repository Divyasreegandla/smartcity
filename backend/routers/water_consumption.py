from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from services.water_service import WaterService
from schemas.water_consumption_schemas import WaterConsumptionCreate, WaterConsumptionResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/water-consumption", tags=["Consumption"])


@router.post("/", response_model=WaterConsumptionResponse, status_code=status.HTTP_201_CREATED)
def add_consumption(
    consumption_data: WaterConsumptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Add daily water consumption (Admin only)"""
    service = WaterService(db)
    consumption, error = service.add_consumption(consumption_data)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return consumption


@router.get("/", response_model=List[WaterConsumptionResponse])
def get_consumption(
    skip: int = 0,
    limit: int = 100,
    zone_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water consumption records"""
    service = WaterService(db)
    return service.get_consumption_records(skip, limit, zone_id, start_date, end_date)


@router.get("/zone/{zone_id}")
def get_zone_consumption_summary(
    zone_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consumption summary for a zone"""
    service = WaterService(db)
    summary = service.get_zone_consumption_summary(zone_id, start_date, end_date)
    
    if not summary:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    return summary