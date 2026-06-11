from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import shutil
from pathlib import Path

from database.database import get_db
from services.complaint_service import ComplaintService
from models.users import User
from schemas.complaint_schemas import (
    ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate,
    ComplaintStatusHistoryResponse
)
from utils.auth_utils import get_current_user, get_current_admin_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])

UPLOAD_DIR = Path("uploads/complaints")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["citizen", "admin"]:
        raise HTTPException(status_code=403, detail="Only citizens can create complaints")

    service = ComplaintService(db)
    complaint = service.create_complaint(complaint_data, current_user.id)
    
    return service.get_complaint_with_details(complaint.id, current_user.id, current_user.role)


@router.post("/{complaint_id}/upload")
def upload_attachment(
    complaint_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ComplaintService(db)
    complaint = service.complaint_repo.get_by_id(complaint_id)
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if current_user.role != "admin" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size = file_path.stat().st_size
    if file_size > MAX_FILE_SIZE:
        file_path.unlink()
        raise HTTPException(status_code=400, detail="File too large")
    
    attachment = service.add_attachment(complaint_id, file.filename, str(file_path), file_size)
    
    return {"message": "File uploaded", "file_id": attachment["id"]}


@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    complaint_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ComplaintService(db)
    complaints = service.get_user_complaints(
        user_id=current_user.id,
        role=current_user.role,
        skip=skip,
        limit=limit,
        status=status,
        priority=priority,
        complaint_type=complaint_type
    )
    return complaints


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ComplaintService(db)
    complaint = service.get_complaint_with_details(
        complaint_id, current_user.id, current_user.role
    )
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return complaint


@router.put("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = ComplaintService(db)
    complaint = service.update_complaint_status(complaint_id, status_update, current_user.id)
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return complaint


@router.get("/{complaint_id}/history")
def get_complaint_history(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ComplaintService(db)
    history = service.get_complaint_history(complaint_id, current_user.id, current_user.role)
    
    if history is None:
        raise HTTPException(status_code=404, detail="Complaint not found or access denied")
    
    return history


@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = ComplaintService(db)
    deleted = service.delete_complaint(complaint_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return {"message": "Complaint deleted successfully"}