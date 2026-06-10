from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.waste_bins import WasteBin, BinStatus
from schemas.waste_bin_schemas import WasteBinCreate, WasteBinUpdate, WasteBinResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/waste-bins", tags=["Waste bin"])

@router.post("/", response_model=WasteBinResponse, status_code=status.HTTP_201_CREATED)
def create_bin(
    data: WasteBinCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    existing = db.query(WasteBin).filter(WasteBin.bin_code == data.bin_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bin code already exists")
    
    db_bin = WasteBin(**data.model_dump())
    db.add(db_bin)
    db.commit()
    db.refresh(db_bin)
    return db_bin

@router.get("/", response_model=List[WasteBinResponse])
def get_bins(
    skip: int = 0,
    limit: int = 100,
    status: Optional[BinStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(WasteBin)
    if status:
        query = query.filter(WasteBin.status == status)
    return query.offset(skip).limit(limit).all()

@router.get("/{bin_id}", response_model=WasteBinResponse)
def get_bin(
    bin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bin = db.query(WasteBin).filter(WasteBin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    return bin

@router.put("/{bin_id}", response_model=WasteBinResponse)
def update_bin(
    bin_id: int,
    data: WasteBinUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    bin = db.query(WasteBin).filter(WasteBin.id == bin_id).first()
    if not bin:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bin, field, value)
    
    # Auto-update status based on fill level
    if 'fill_level' in update_data:
        fill_percentage = (bin.fill_level / bin.bin_capacity) * 100
        if fill_percentage >= 100:
            bin.status = BinStatus.OVERFLOWING
        elif fill_percentage >= 80:
            bin.status = BinStatus.FULL
        elif fill_percentage >= 30:
            bin.status = BinStatus.PARTIAL
        else:
            bin.status = BinStatus.EMPTY
    
    db.commit()
    db.refresh(bin)
    return bin