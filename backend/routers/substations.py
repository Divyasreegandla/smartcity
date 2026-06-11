from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.power_service import PowerService
from schemas.substation_schemas import SubstationCreate, SubstationUpdate, SubstationResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/substations", tags=["Substations"])


@router.post("/", response_model=SubstationResponse, status_code=status.HTTP_201_CREATED)
def create_substation(
    data: SubstationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new substation (Admin only)"""
    service = PowerService(db)
    substation, error = service.create_substation(data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return substation


@router.get("/", response_model=List[SubstationResponse])
def get_substations(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all substations"""
    service = PowerService(db)
    return service.get_all_substations(skip, limit, status)


@router.get("/{substation_id}", response_model=SubstationResponse)
def get_substation(
    substation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get substation by ID"""
    service = PowerService(db)
    substation = service.get_substation_by_id(substation_id)
    
    if not substation:
        raise HTTPException(status_code=404, detail="Substation not found")
    
    return substation


@router.put("/{substation_id}", response_model=SubstationResponse)
def update_substation(
    substation_id: int,
    data: SubstationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update substation (Admin only)"""
    service = PowerService(db)
    substation = service.update_substation(substation_id, data)
    
    if not substation:
        raise HTTPException(status_code=404, detail="Substation not found")
    
    return substation


@router.delete("/{substation_id}")
def delete_substation(
    substation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete substation (Admin only)"""
    service = PowerService(db)
    deleted, error = service.delete_substation(substation_id)
    
    if not deleted:
        raise HTTPException(status_code=400, detail=error or "Substation not found")
    
    return {"message": "Substation deleted successfully"}