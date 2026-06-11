from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.power_service import PowerService
from schemas.transformer_schemas import TransformerCreate, TransformerUpdate, TransformerResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/transformers", tags=["Transformers"])


@router.post("/", response_model=TransformerResponse, status_code=status.HTTP_201_CREATED)
def create_transformer(
    data: TransformerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new transformer (Admin only)"""
    service = PowerService(db)
    transformer, error = service.create_transformer(data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return transformer


@router.get("/", response_model=List[TransformerResponse])
def get_transformers(
    skip: int = 0,
    limit: int = 100,
    substation_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transformers"""
    service = PowerService(db)
    return service.get_all_transformers(skip, limit, substation_id, status)


@router.get("/{transformer_id}", response_model=TransformerResponse)
def get_transformer(
    transformer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transformer by ID"""
    service = PowerService(db)
    transformer = service.get_transformer_by_id(transformer_id)
    
    if not transformer:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    return transformer


@router.put("/{transformer_id}", response_model=TransformerResponse)
def update_transformer(
    transformer_id: int,
    data: TransformerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update transformer status (Admin only)"""
    service = PowerService(db)
    transformer = service.update_transformer(transformer_id, data)
    
    if not transformer:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    return transformer


@router.get("/{transformer_id}/health")
def get_transformer_health(
    transformer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transformer health status"""
    service = PowerService(db)
    health = service.get_transformer_health(transformer_id)
    
    if not health:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    return health


@router.get("/{transformer_id}/maintenance-history")
def get_transformer_maintenance(
    transformer_id: int,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transformer maintenance history"""
    service = PowerService(db)
    history = service.get_transformer_maintenance_history(transformer_id, limit)
    
    return history