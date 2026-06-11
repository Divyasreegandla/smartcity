from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime
from models.complaints import Complaint, ComplaintStatus, ComplaintPriority
from models.complaint_attachments import ComplaintAttachment
from models.complaint_status_history import ComplaintStatusHistory
from models.users import User
from .base_repository import BaseRepository


class ComplaintRepository(BaseRepository[Complaint]):
    def __init__(self, db: Session):
        super().__init__(Complaint, db)

    def get_by_complaint_number(self, complaint_number: str) -> Optional[Complaint]:
        """Get complaint by complaint number"""
        return self.db.query(Complaint).filter(Complaint.complaint_number == complaint_number).first()

    def get_by_citizen_id(self, citizen_id: int, skip: int = 0, limit: int = 100) -> List[Complaint]:
        """Get complaints by citizen ID"""
        return self.db.query(Complaint).filter(Complaint.citizen_id == citizen_id).offset(skip).limit(limit).all()

    def get_with_filters(
        self,
        skip: int = 0,
        limit: int = 100,
        citizen_id: Optional[int] = None,
        status: Optional[ComplaintStatus] = None,
        priority: Optional[ComplaintPriority] = None,
        complaint_type: Optional[str] = None
    ) -> List[Complaint]:
        """Get complaints with multiple filters"""
        query = self.db.query(Complaint)
        if citizen_id:
            query = query.filter(Complaint.citizen_id == citizen_id)
        if status:
            query = query.filter(Complaint.status == status)
        if priority:
            query = query.filter(Complaint.priority == priority)
        if complaint_type:
            query = query.filter(Complaint.complaint_type == complaint_type)
        return query.offset(skip).limit(limit).all()

    def update_status(
        self,
        complaint_id: int,
        new_status: ComplaintStatus,
        updated_by: int,
        remarks: str = None
    ) -> Optional[Complaint]:
        """Update complaint status and create history record"""
        complaint = self.get_by_id(complaint_id)
        if complaint:
            old_status = complaint.status.value
            complaint.status = new_status
            self.db.commit()
            self.db.refresh(complaint)

            # Create history record
            history = ComplaintStatusHistory(
                complaint_id=complaint_id,
                old_status=old_status,
                new_status=new_status.value,
                remarks=remarks,
                updated_by=updated_by
            )
            self.db.add(history)
            self.db.commit()
        return complaint

    def get_status_history(self, complaint_id: int) -> List[dict]:
        """Get status history for a complaint"""
        history = self.db.query(ComplaintStatusHistory).filter(
            ComplaintStatusHistory.complaint_id == complaint_id
        ).order_by(ComplaintStatusHistory.updated_at.desc()).all()

        result = []
        for h in history:
            user = self.db.query(User).filter(User.id == h.updated_by).first()
            result.append({
                "id": h.id,
                "old_status": h.old_status,
                "new_status": h.new_status,
                "remarks": h.remarks,
                "updated_by": user.full_name if user else "Unknown",
                "updated_at": h.updated_at
            })
        return result

    def get_attachments(self, complaint_id: int) -> List[ComplaintAttachment]:
        """Get attachments for a complaint"""
        return self.db.query(ComplaintAttachment).filter(
            ComplaintAttachment.complaint_id == complaint_id
        ).all()

    def add_attachment(self, complaint_id: int, file_name: str, file_path: str, file_size: int) -> ComplaintAttachment:
        """Add attachment to complaint"""
        attachment = ComplaintAttachment(
            complaint_id=complaint_id,
            file_name=file_name,
            file_path=file_path,
            file_size=file_size
        )
        self.db.add(attachment)
        self.db.commit()
        self.db.refresh(attachment)
        return attachment

    def get_today_count(self) -> int:
        """Get number of complaints created today"""
        today = datetime.now().replace(hour=0, minute=0, second=0)
        return self.db.query(Complaint).filter(Complaint.created_at >= today).count()

    def generate_complaint_number(self) -> str:
        """Generate unique complaint number"""
        today = datetime.now().strftime("%Y%m%d")
        count = self.get_today_count()
        return f"CMP-{today}-{str(count + 1).zfill(4)}"