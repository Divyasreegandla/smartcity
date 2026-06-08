from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.transformer_maintenance import TransformerMaintenance, MaintenanceType
from models.transformers import Transformer
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
    transformer = db.query(Transformer).filter(Transformer.id == data.transformer_id).first()
    if not transformer:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    db_maintenance = TransformerMaintenance(**data.model_dump())
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    
    return {
        **db_maintenance.__dict__,
        "transformer_code": transformer.transformer_code
    }

@router.get("/", response_model=List[MaintenanceResponse])
def get_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    transformer_id: Optional[int] = None,
    maintenance_type: Optional[MaintenanceType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get maintenance history"""
    query = db.query(TransformerMaintenance)
    if transformer_id:
        query = query.filter(TransformerMaintenance.transformer_id == transformer_id)
    if maintenance_type:
        query = query.filter(TransformerMaintenance.maintenance_type == maintenance_type)
    
    records = query.offset(skip).limit(limit).all()
    
    result = []
    for r in records:
        transformer = db.query(Transformer).filter(Transformer.id == r.transformer_id).first()
        result.append({
            **r.__dict__,
            "transformer_code": transformer.transformer_code if transformer else None
        })
    return result

@router.put("/{maintenance_id}", response_model=MaintenanceResponse)
def update_maintenance(
    maintenance_id: int,
    data: MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update maintenance record (Admin only)"""
    maintenance = db.query(TransformerMaintenance).filter(TransformerMaintenance.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(maintenance, field, value)
    
    db.commit()
    db.refresh(maintenance)
    
    transformer = db.query(Transformer).filter(Transformer.id == maintenance.transformer_id).first()
    return {
        **maintenance.__dict__,
        "transformer_code": transformer.transformer_code if transformer else None
    }