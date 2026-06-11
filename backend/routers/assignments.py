from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from services.assignment_service import AssignmentService
from schemas.assignment_schemas import ComplaintAssign
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def assign_complaint(
    assign_data: ComplaintAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = AssignmentService(db)
    assignment, error = service.assign_complaint(
        complaint_id=assign_data.complaint_id,
        department_id=assign_data.department_id,
        assigned_by=current_user.id,
        assigned_to=assign_data.assigned_to,
        remarks=assign_data.remarks
    )
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return {"message": "Complaint assigned successfully"}


@router.get("/complaint/{complaint_id}")
def get_complaint_assignments(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = AssignmentService(db)
    return service.get_complaint_assignments(complaint_id)


@router.get("/my-assignments")
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get assignments for current user (citizen can see their complaints, admin sees all)"""
    service = AssignmentService(db)
    return service.get_my_assignments(current_user.id, current_user.role)