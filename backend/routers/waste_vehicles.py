from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.waste_service import WasteManagementService
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
    service = WasteManagementService(db)
    vehicle, error = service.create_vehicle(data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return vehicle


@router.get("/", response_model=List[WasteVehicleResponse])
def get_vehicles(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_all_vehicles(skip, limit, status)


@router.get("/{vehicle_id}", response_model=WasteVehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    vehicle = service.get_vehicle_by_id(vehicle_id)
    
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
    service = WasteManagementService(db)
    vehicle = service.update_vehicle(vehicle_id, data)
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return vehicle


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WasteManagementService(db)
    deleted = service.delete_vehicle(vehicle_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle deleted successfully"}