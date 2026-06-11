# services/complaint_service.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.complaint_repository import ComplaintRepository
from repositories.user_repository import UserRepository
from repositories.assignment_repository import AssignmentRepository
from models.complaints import ComplaintStatus
from schemas.complaint_schemas import ComplaintCreate, ComplaintStatusUpdate


# Keep this function for backward compatibility
def generate_complaint_number(db: Session) -> str:
    """Generate a unique complaint number (legacy function)"""
    repo = ComplaintRepository(db)
    return repo.generate_complaint_number()


class ComplaintService:
    def __init__(self, db: Session):
        self.db = db
        self.complaint_repo = ComplaintRepository(db)
        self.user_repo = UserRepository(db)
        self.assignment_repo = AssignmentRepository(db)

    def create_complaint(self, complaint_data: ComplaintCreate, citizen_id: int):
        """Create a new complaint"""
        complaint_number = self.complaint_repo.generate_complaint_number()
        
        complaint = self.complaint_repo.create(
            complaint_number=complaint_number,
            citizen_id=citizen_id,
            **complaint_data.model_dump()
        )
        
        # Add status history
        self.complaint_repo.update_status(
            complaint_id=complaint.id,
            new_status=ComplaintStatus.PENDING,
            updated_by=citizen_id,
            remarks="Complaint created"
        )
        
        return complaint

    def get_complaint_with_details(self, complaint_id: int, user_id: int, user_role: str) -> Optional[Dict]:
        """Get complaint with citizen details"""
        complaint = self.complaint_repo.get_by_id(complaint_id)
        if not complaint:
            return None
        
        # Check access
        if user_role != "admin" and complaint.citizen_id != user_id:
            return None
        
        citizen = self.user_repo.get_by_id(complaint.citizen_id)
        
        return {
            **complaint.__dict__,
            "citizen_name": citizen.full_name if citizen else None
        }

    def update_complaint_status(self, complaint_id: int, status_update: ComplaintStatusUpdate, admin_id: int):
        """Update complaint status"""
        complaint = self.complaint_repo.get_by_id(complaint_id)
        if not complaint:
            return None
        
        complaint = self.complaint_repo.update_status(
            complaint_id=complaint_id,
            new_status=status_update.status,
            updated_by=admin_id,
            remarks=status_update.remarks
        )
        
        return self.get_complaint_with_details(complaint_id, admin_id, "admin")

    def get_user_complaints(self, user_id: int, role: str, skip: int = 0, limit: int = 100, 
                           status: Optional[str] = None, priority: Optional[str] = None,
                           complaint_type: Optional[str] = None) -> List[Dict]:
        """Get complaints for a user"""
        if role == "citizen":
            complaints = self.complaint_repo.get_with_filters(
                skip=skip, limit=limit,
                citizen_id=user_id,
                status=status, priority=priority, complaint_type=complaint_type
            )
        else:
            complaints = self.complaint_repo.get_with_filters(
                skip=skip, limit=limit,
                status=status, priority=priority, complaint_type=complaint_type
            )
        
        result = []
        for complaint in complaints:
            citizen = self.user_repo.get_by_id(complaint.citizen_id)
            result.append({
                **complaint.__dict__,
                "citizen_name": citizen.full_name if citizen else None
            })
        
        return result

    def get_complaint_history(self, complaint_id: int, user_id: int, user_role: str) -> Optional[List[Dict]]:
        """Get complaint status history"""
        complaint = self.complaint_repo.get_by_id(complaint_id)
        if not complaint:
            return None
        
        if user_role != "admin" and complaint.citizen_id != user_id:
            return None
        
        return self.complaint_repo.get_status_history(complaint_id)

    def add_attachment(self, complaint_id: int, file_name: str, file_path: str, file_size: int) -> Dict:
        """Add attachment to complaint"""
        attachment = self.complaint_repo.add_attachment(complaint_id, file_name, file_path, file_size)
        return {
            "id": attachment.id,
            "file_name": attachment.file_name,
            "file_size": attachment.file_size,
            "uploaded_at": attachment.uploaded_at
        }

    def delete_complaint(self, complaint_id: int) -> bool:
        """Delete a complaint"""
        return self.complaint_repo.delete(complaint_id)