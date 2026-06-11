from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.power_service import PowerService
from schemas.maintenance_schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/transformer-maintenance", tags=["Maintenance"])


@router.post("/", response_model=MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    data: MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Schedule maintenance for transformer (Admin only)"""
    service = PowerService(db)
    maintenance = service.create_maintenance(data)
    
    if not maintenance:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    return maintenance


@router.get("/", response_model=List[MaintenanceResponse])
def get_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    transformer_id: Optional[int] = None,
    maintenance_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance history"""
    service = PowerService(db)
    return service.get_maintenance_records(skip, limit, transformer_id, maintenance_type)


@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance(
    maintenance_id: int,
    data: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update maintenance record (Admin only)"""
    service = PowerService(db)
    maintenance = service.update_maintenance(maintenance_id, data)
    
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    return maintenance