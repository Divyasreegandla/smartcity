from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.waste_service import WasteManagementService
from schemas.sanitation_worker_schemas import SanitationWorkerCreate, SanitationWorkerUpdate, SanitationWorkerResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/sanitation-workers", tags=["Sanitation worker"])


@router.post("/", response_model=SanitationWorkerResponse, status_code=status.HTTP_201_CREATED)
def create_worker(
    data: SanitationWorkerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WasteManagementService(db)
    worker, error = service.create_worker(data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return worker


@router.get("/", response_model=List[SanitationWorkerResponse])
def get_workers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    shift_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_all_workers(skip, limit, status, shift_type)


@router.get("/{worker_id}", response_model=SanitationWorkerResponse)
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    worker = service.get_worker_by_id(worker_id)
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    return worker


@router.put("/{worker_id}", response_model=SanitationWorkerResponse)
def update_worker(
    worker_id: int,
    data: SanitationWorkerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WasteManagementService(db)
    worker = service.update_worker(worker_id, data)
    
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    return worker