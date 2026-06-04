from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.water_tanks import WaterTank, TankStatus
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
    db_tank = WaterTank(**tank_data.model_dump())
    db.add(db_tank)
    db.commit()
    db.refresh(db_tank)
    return db_tank

@router.get("/", response_model=List[WaterTankResponse])
def get_water_tanks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[TankStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all water tanks"""
    query = db.query(WaterTank)
    if status:
        query = query.filter(WaterTank.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{tank_id}", response_model=WaterTankResponse)
def get_water_tank(
    tank_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water tank by ID"""
    tank = db.query(WaterTank).filter(WaterTank.id == tank_id).first()
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
    tank = db.query(WaterTank).filter(WaterTank.id == tank_id).first()
    if not tank:
        raise HTTPException(status_code=404, detail="Water tank not found")
    
    update_data = tank_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tank, field, value)
    
    # Auto-update status based on fill percentage
    if 'current_level' in update_data:
        fill_percentage = (tank.current_level / tank.capacity_liters) * 100
        if fill_percentage >= 90:
            tank.status = TankStatus.FULL
        elif fill_percentage >= 50:
            tank.status = TankStatus.PARTIAL
        elif fill_percentage >= 20:
            tank.status = TankStatus.LOW
        else:
            tank.status = TankStatus.CRITICAL
    
    db.commit()
    db.refresh(tank)
    return tank