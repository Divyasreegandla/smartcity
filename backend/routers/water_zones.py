from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.water_service import WaterService
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
    service = WaterService(db)
    zone, error = service.create_zone(zone_data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return zone


@router.get("/", response_model=List[WaterZoneResponse])
def get_water_zones(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WaterService(db)
    return service.get_all_zones(skip, limit, status)


@router.get("/{zone_id}", response_model=WaterZoneResponse)
def get_water_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WaterService(db)
    zone = service.get_zone_by_id(zone_id)
    
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
    service = WaterService(db)
    zone = service.update_zone(zone_id, zone_data)
    
    if not zone:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    return zone


@router.delete("/{zone_id}")
def delete_water_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WaterService(db)
    deleted = service.delete_zone(zone_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Water zone not found")
    
    return {"message": "Water zone deleted successfully"}