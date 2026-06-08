from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.transformers import Transformer, TransformerStatus
from models.substations import Substation
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
    substation = db.query(Substation).filter(Substation.id == data.substation_id).first()
    if not substation:
        raise HTTPException(status_code=404, detail="Substation not found")
    
    existing = db.query(Transformer).filter(Transformer.transformer_code == data.transformer_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Transformer code already exists")
    
    db_transformer = Transformer(**data.model_dump())
    db.add(db_transformer)
    db.commit()
    db.refresh(db_transformer)
    
    return {
        **db_transformer.__dict__,
        "substation_name": substation.substation_name
    }

@router.get("/", response_model=List[TransformerResponse])
def get_transformers(
    skip: int = 0,
    limit: int = 100,
    substation_id: Optional[int] = None,
    status: Optional[TransformerStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all transformers"""
    query = db.query(Transformer)
    if substation_id:
        query = query.filter(Transformer.substation_id == substation_id)
    if status:
        query = query.filter(Transformer.status == status)
    
    transformers = query.offset(skip).limit(limit).all()
    
    result = []
    for t in transformers:
        substation = db.query(Substation).filter(Substation.id == t.substation_id).first()
        result.append({
            **t.__dict__,
            "substation_name": substation.substation_name if substation else None
        })
    return result

@router.get("/{transformer_id}", response_model=TransformerResponse)
def get_transformer(
    transformer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transformer by ID"""
    transformer = db.query(Transformer).filter(Transformer.id == transformer_id).first()
    if not transformer:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    substation = db.query(Substation).filter(Substation.id == transformer.substation_id).first()
    return {
        **transformer.__dict__,
        "substation_name": substation.substation_name if substation else None
    }

@router.put("/{transformer_id}", response_model=TransformerResponse)
def update_transformer(
    transformer_id: int,
    data: TransformerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update transformer status (Admin only)"""
    transformer = db.query(Transformer).filter(Transformer.id == transformer_id).first()
    if not transformer:
        raise HTTPException(status_code=404, detail="Transformer not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(transformer, field, value)
    
    db.commit()
    db.refresh(transformer)
    
    substation = db.query(Substation).filter(Substation.id == transformer.substation_id).first()
    return {
        **transformer.__dict__,
        "substation_name": substation.substation_name if substation else None
    }