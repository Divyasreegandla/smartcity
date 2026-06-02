from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
import shutil
from pathlib import Path

from database.database import get_db
from models.users import User
from models.complaints import Complaint, ComplaintStatus, ComplaintPriority
from models.complaint_attachments import ComplaintAttachment
from models.complaint_status_history import ComplaintStatusHistory
from schemas.complaint_schemas import ComplaintCreate, ComplaintResponse, ComplaintStatusUpdate
from utils.auth_utils import get_current_user, get_current_admin_user

router = APIRouter(prefix="/complaints", tags=["Complaints"])

UPLOAD_DIR = Path("uploads/complaints")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024

def generate_complaint_number(db: Session) -> str:
    today = datetime.now().strftime("%Y%m%d")
    count = db.query(Complaint).filter(
        Complaint.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
    ).count()
    return f"CMP-{today}-{str(count + 1).zfill(4)}"

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["citizen", "admin"]:
        raise HTTPException(status_code=403, detail="Only citizens can create complaints")
    
    complaint_number = generate_complaint_number(db)
    
    db_complaint = Complaint(
        complaint_number=complaint_number,
        citizen_id=current_user.id,
        **complaint_data.model_dump()
    )
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    
    history = ComplaintStatusHistory(
        complaint_id=db_complaint.id,
        old_status="none",
        new_status=ComplaintStatus.PENDING.value,
        remarks="Complaint created",
        updated_by=current_user.id
    )
    db.add(history)
    db.commit()
    
    return db_complaint

@router.post("/{complaint_id}/upload")
def upload_attachment(
    complaint_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
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
    
    attachment = ComplaintAttachment(
        complaint_id=complaint_id,
        file_name=file.filename,
        file_path=str(file_path),
        file_size=file_size
    )
    db.add(attachment)
    db.commit()
    
    return {"message": "File uploaded", "file_id": attachment.id}

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
    query = db.query(Complaint)
    
    if current_user.role == "citizen":
        query = query.filter(Complaint.citizen_id == current_user.id)
    
    if status:
        query = query.filter(Complaint.status == status)
    if priority:
        query = query.filter(Complaint.priority == priority)
    if complaint_type:
        query = query.filter(Complaint.complaint_type == complaint_type)
    
    complaints = query.offset(skip).limit(limit).all()
    
    result = []
    for complaint in complaints:
        citizen = db.query(User).filter(User.id == complaint.citizen_id).first()
        result.append({
            **complaint.__dict__,
            "citizen_name": citizen.full_name if citizen else None
        })
    
    return result

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if current_user.role != "admin" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    citizen = db.query(User).filter(User.id == complaint.citizen_id).first()
    
    return {
        **complaint.__dict__,
        "citizen_name": citizen.full_name if citizen else None
    }

@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(
    complaint_id: int,
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if current_user.role != "admin" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    for field, value in complaint_data.model_dump().items():
        setattr(complaint, field, value)
    
    db.commit()
    db.refresh(complaint)
    
    citizen = db.query(User).filter(User.id == complaint.citizen_id).first()
    
    return {
        **complaint.__dict__,
        "citizen_name": citizen.full_name if citizen else None
    }

@router.delete("/{complaint_id}")
def delete_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    db.delete(complaint)
    db.commit()
    
    return {"message": "Complaint deleted successfully"}

@router.put("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    status_update: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    old_status = complaint.status.value
    complaint.status = status_update.status
    
    history = ComplaintStatusHistory(
        complaint_id=complaint_id,
        old_status=old_status,
        new_status=status_update.status.value,
        remarks=status_update.remarks,
        updated_by=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)
    
    citizen = db.query(User).filter(User.id == complaint.citizen_id).first()
    
    return {
        **complaint.__dict__,
        "citizen_name": citizen.full_name if citizen else None
    }

@router.get("/{complaint_id}/history")
def get_complaint_history(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if current_user.role != "admin" and complaint.citizen_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    history = db.query(ComplaintStatusHistory).filter(
        ComplaintStatusHistory.complaint_id == complaint_id
    ).order_by(ComplaintStatusHistory.updated_at.desc()).all()
    
    result = []
    for h in history:
        user = db.query(User).filter(User.id == h.updated_by).first()
        result.append({
            "id": h.id,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "remarks": h.remarks,
            "updated_by": user.full_name if user else "Unknown",
            "updated_at": h.updated_at
        })
    
    return result