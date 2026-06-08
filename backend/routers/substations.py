from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.substations import Substation, SubstationStatus
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
    existing = db.query(Substation).filter(
        (Substation.substation_code == data.substation_code) |
        (Substation.substation_name == data.substation_name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Substation code or name already exists")
    
    db_substation = Substation(**data.model_dump())
    db.add(db_substation)
    db.commit()
    db.refresh(db_substation)
    return db_substation

@router.get("/", response_model=List[SubstationResponse])
def get_substations(
    skip: int = 0,
    limit: int = 100,
    status: Optional[SubstationStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all substations"""
    query = db.query(Substation)
    if status:
        query = query.filter(Substation.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{substation_id}", response_model=SubstationResponse)
def get_substation(
    substation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get substation by ID"""
    substation = db.query(Substation).filter(Substation.id == substation_id).first()
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
    substation = db.query(Substation).filter(Substation.id == substation_id).first()
    if not substation:
        raise HTTPException(status_code=404, detail="Substation not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(substation, field, value)
    
    db.commit()
    db.refresh(substation)
    return substation

@router.delete("/{substation_id}")
def delete_substation(
    substation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete substation (Admin only)"""
    substation = db.query(Substation).filter(Substation.id == substation_id).first()
    if not substation:
        raise HTTPException(status_code=404, detail="Substation not found")
    
    db.delete(substation)
    db.commit()
    return {"message": "Substation deleted successfully"}