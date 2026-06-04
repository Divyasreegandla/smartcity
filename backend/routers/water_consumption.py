from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from models.water_consumption import WaterConsumption
from models.water_zones import WaterZone
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
    zone = db.query(WaterZone).filter(WaterZone.id == consumption_data.zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    db_consumption = WaterConsumption(**consumption_data.model_dump())
    db.add(db_consumption)
    db.commit()
    db.refresh(db_consumption)
    
    return {**db_consumption.__dict__, "zone_name": zone.zone_name}

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
    query = db.query(WaterConsumption)
    if zone_id:
        query = query.filter(WaterConsumption.zone_id == zone_id)
    if start_date:
        query = query.filter(WaterConsumption.consumption_date >= start_date)
    if end_date:
        query = query.filter(WaterConsumption.consumption_date <= end_date)
    
    records = query.offset(skip).limit(limit).all()
    
    result = []
    for record in records:
        zone = db.query(WaterZone).filter(WaterZone.id == record.zone_id).first()
        result.append({
            **record.__dict__,
            "zone_name": zone.zone_name if zone else None
        })
    return result

@router.get("/zone/{zone_id}")
def get_zone_consumption_summary(
    zone_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consumption summary for a zone"""
    zone = db.query(WaterZone).filter(WaterZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    query = db.query(WaterConsumption).filter(WaterConsumption.zone_id == zone_id)
    if start_date:
        query = query.filter(WaterConsumption.consumption_date >= start_date)
    if end_date:
        query = query.filter(WaterConsumption.consumption_date <= end_date)
    
    records = query.all()
    total_consumption = sum(r.total_liters_consumed for r in records)
    avg_consumption = total_consumption / len(records) if records else 0
    
    return {
        "zone_id": zone_id,
        "zone_name": zone.zone_name,
        "zone_code": zone.zone_code,
        "total_records": len(records),
        "total_consumption_liters": total_consumption,
        "average_consumption_liters": avg_consumption
    }