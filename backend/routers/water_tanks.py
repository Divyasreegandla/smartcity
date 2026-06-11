from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.water_service import WaterService
from schemas.water_tank_schemas import WaterTankCreate, WaterTankUpdate, WaterTankResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/water-tanks", tags=["Water Tank"])


@router.post("/", response_model=WaterTankResponse, status_code=status.HTTP_201_CREATED)
def create_water_tank(
    tank_data: WaterTankCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new water tank (Admin only)"""
    service = WaterService(db)
    tank = service.create_tank(tank_data)
    return tank


@router.get("/", response_model=List[WaterTankResponse])
def get_water_tanks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all water tanks"""
    service = WaterService(db)
    return service.get_all_tanks(skip, limit, status)


@router.get("/{tank_id}", response_model=WaterTankResponse)
def get_water_tank(
    tank_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water tank by ID"""
    service = WaterService(db)
    tank = service.get_tank_by_id(tank_id)
    
    if not tank:
        raise HTTPException(status_code=404, detail="Water tank not found")
    
    return tank


@router.put("/{tank_id}", response_model=WaterTankResponse)
def update_water_tank(
    tank_id: int,
    tank_data: WaterTankUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update water tank (Admin only)"""
    service = WaterService(db)
    tank = service.update_tank(tank_id, tank_data)
    
    if not tank:
        raise HTTPException(status_code=404, detail="Water tank not found")
    
    return tank


@router.delete("/{tank_id}")
def delete_water_tank(
    tank_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete water tank (Admin only)"""
    service = WaterService(db)
    deleted = service.delete_tank(tank_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Water tank not found")
    
    return {"message": "Water tank deleted successfully"}