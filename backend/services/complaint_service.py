from sqlalchemy.orm import Session
from app.repositories.complaint_repository import ComplaintRepository
from backend.models.complaint_status_history import ComplaintStatusHistory
from backend.models.complaints import Complaint, ComplaintStatus
from datetime import datetime

def generate_complaint_number(db: Session) -> str:
    today = datetime.now().strftime("%Y%m%d")
    count = db.query(ComplaintRepository.model).filter(
        Complaint.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
    ).count()
    return f"CMP-{today}-{str(count + 1).zfill(4)}"

class ComplaintService:
    def __init__(self, db: Session):
        self.complaint_repo = ComplaintRepository(db)
        self.db = db

    def create_complaint(self, complaint_data, citizen_id):
        complaint_number = generate_complaint_number(self.db)
        
        complaint = self.complaint_repo.create({
            "complaint_number": complaint_number,
            "citizen_id": citizen_id,
            **complaint_data.model_dump()
        })
        
        history = ComplaintStatusHistory(
            complaint_id=complaint.id,
            old_status="none",
            new_status=ComplaintStatus.PENDING.value,
            remarks="Complaint created",
            updated_by=citizen_id
        )
        self.db.add(history)
        self.db.commit()
        
        return complaint