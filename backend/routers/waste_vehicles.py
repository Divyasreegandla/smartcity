from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.waste_vehicles import WasteVehicle, VehicleStatus
from schemas.waste_vehicle_schemas import WasteVehicleCreate, WasteVehicleUpdate, WasteVehicleResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/waste-vehicles", tags=["Waste Vehicle"])

@router.post("/", response_model=WasteVehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    data: WasteVehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    existing = db.query(WasteVehicle).filter(WasteVehicle.vehicle_number == data.vehicle_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle number already exists")
    
    db_vehicle = WasteVehicle(**data.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.get("/", response_model=List[WasteVehicleResponse])
def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[VehicleStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WasteVehicle)
    if status:
        query = query.filter(WasteVehicle.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{vehicle_id}", response_model=WasteVehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.put("/{vehicle_id}", response_model=WasteVehicleResponse)
def update_vehicle(
    vehicle_id: int,
    data: WasteVehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    return {"message": "Vehicle deleted successfully"}