from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.sanitation_workers import SanitationWorker, WorkerStatus, ShiftType
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
    existing = db.query(SanitationWorker).filter(SanitationWorker.employee_code == data.employee_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee code already exists")
    
    db_worker = SanitationWorker(**data.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.get("/", response_model=List[SanitationWorkerResponse])
def get_workers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[WorkerStatus] = None,
    shift_type: Optional[ShiftType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(SanitationWorker)
    if status:
        query = query.filter(SanitationWorker.status == status)
    if shift_type:
        query = query.filter(SanitationWorker.shift_type == shift_type)
    return query.offset(skip).limit(limit).all()

@router.get("/{worker_id}", response_model=SanitationWorkerResponse)
def get_worker(
    worker_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    worker = db.query(SanitationWorker).filter(SanitationWorker.id == worker_id).first()
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
    worker = db.query(SanitationWorker).filter(SanitationWorker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(worker, field, value)
    
    db.commit()
    db.refresh(worker)
    return worker