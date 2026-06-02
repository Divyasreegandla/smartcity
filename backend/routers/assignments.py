from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.complaints import Complaint, ComplaintStatus
from models.departments import Department
from models.complaint_assignments import ComplaintAssignment
from schemas.assignment_schemas import ComplaintAssign
from utils.auth_utils import get_current_user, get_current_admin_user  # Add this import
from models.users import User

router = APIRouter(prefix="/assignments", tags=["Assignments"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def assign_complaint(
    assign_data: ComplaintAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Check if complaint exists
    complaint = db.query(Complaint).filter(Complaint.id == assign_data.complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check if department exists
    department = db.query(Department).filter(Department.id == assign_data.department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Create assignment
    assignment = ComplaintAssignment(
        complaint_id=assign_data.complaint_id,
        department_id=assign_data.department_id,
        assigned_to=assign_data.assigned_to,
        remarks=assign_data.remarks
    )
    db.add(assignment)
    
    # Update complaint status to ASSIGNED
    complaint.status = ComplaintStatus.ASSIGNED
    db.commit()
    
    return {"message": "Complaint assigned successfully"}

@router.get("/complaint/{complaint_id}")
def get_complaint_assignments(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    assignments = db.query(ComplaintAssignment).filter(
        ComplaintAssignment.complaint_id == complaint_id
    ).all()
    
    result = []
    for assignment in assignments:
        department = db.query(Department).filter(Department.id == assignment.department_id).first()
        result.append({
            "id": assignment.id,
            "complaint_id": assignment.complaint_id,
            "department_id": assignment.department_id,
            "department_name": department.department_name if department else "Unknown",
            "assigned_to": assignment.assigned_to,
            "assigned_at": assignment.assigned_at,
            "remarks": assignment.remarks
        })
    
    return result

@router.get("/my-assignments")
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get assignments for current user (citizen can see their complaints, admin sees all)"""
    
    if current_user.role == "admin":
        assignments = db.query(ComplaintAssignment).all()
    else:
        # Get complaints by this citizen
        complaints = db.query(Complaint).filter(Complaint.citizen_id == current_user.id).all()
        complaint_ids = [c.id for c in complaints]
        assignments = db.query(ComplaintAssignment).filter(
            ComplaintAssignment.complaint_id.in_(complaint_ids)
        ).all()
    
    result = []
    for assignment in assignments:
        complaint = db.query(Complaint).filter(Complaint.id == assignment.complaint_id).first()
        department = db.query(Department).filter(Department.id == assignment.department_id).first()
        
        result.append({
            "id": assignment.id,
            "complaint_id": assignment.complaint_id,
            "complaint_number": complaint.complaint_number if complaint else None,
            "complaint_title": complaint.title if complaint else None,
            "department_name": department.department_name if department else "Unknown",
            "assigned_at": assignment.assigned_at,
            "remarks": assignment.remarks
        })
    
    return result