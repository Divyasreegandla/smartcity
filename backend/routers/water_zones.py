from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.water_zones import WaterZone, ZoneStatus
from schemas.water_zone_schemas import WaterZoneCreate, WaterZoneUpdate, WaterZoneResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/water-zones", tags=["Water Zones"])

@router.post("/", response_model=WaterZoneResponse, status_code=status.HTTP_201_CREATED)
def create_water_zone(
    zone_data: WaterZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new water zone (Admin only)"""
    existing = db.query(WaterZone).filter(
        (WaterZone.zone_code == zone_data.zone_code) | 
        (WaterZone.zone_name == zone_data.zone_name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zone code or name already exists")
    
    db_zone = WaterZone(**zone_data.model_dump())
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

@router.get("/", response_model=List[WaterZoneResponse])
def get_water_zones(
    skip: int = 0,
    limit: int = 100,
    status: Optional[ZoneStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all water zones"""
    query = db.query(WaterZone)
    if status:
        query = query.filter(WaterZone.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{zone_id}", response_model=WaterZoneResponse)
def get_water_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water zone by ID"""
    zone = db.query(WaterZone).filter(WaterZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    return zone

@router.put("/{zone_id}", response_model=WaterZoneResponse)
def update_water_zone(
    zone_id: int,
    zone_data: WaterZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update water zone (Admin only)"""
    zone = db.query(WaterZone).filter(WaterZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    update_data = zone_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(zone, field, value)
    
    db.commit()
    db.refresh(zone)
    return zone

@router.delete("/{zone_id}")
def delete_water_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete water zone (Admin only)"""
    zone = db.query(WaterZone).filter(WaterZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    db.delete(zone)
    db.commit()
    return {"message": "Water zone deleted successfully"}