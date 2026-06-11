from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.waste_service import WasteManagementService
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
    service = WasteManagementService(db)
    bin_obj, error = service.create_bin(data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return bin_obj


@router.get("/", response_model=List[WasteBinResponse])
def get_bins(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_all_bins(skip, limit, status)


@router.get("/{bin_id}", response_model=WasteBinResponse)
def get_bin(
    bin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    bin_obj = service.get_bin_by_id(bin_id)
    
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    return bin_obj


@router.put("/{bin_id}", response_model=WasteBinResponse)
def update_bin(
    bin_id: int,
    data: WasteBinUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WasteManagementService(db)
    bin_obj = service.update_bin(bin_id, data)
    
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    
    return bin_obj