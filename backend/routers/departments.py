from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.departments import Department
from schemas.department_schemas import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    existing = db.query(Department).filter(Department.department_name == department_data.department_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists")
    
    db_department = Department(**department_data.model_dump())
    db.add(db_department)
    db.commit()
    db.refresh(db_department)
    return db_department

@router.get("/", response_model=List[DepartmentResponse])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Department).offset(skip).limit(limit).all()

@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    for field, value in department_data.model_dump(exclude_unset=True).items():
        if value:
            setattr(department, field, value)
    
    db.commit()
    db.refresh(department)
    return department

@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db.delete(department)
    db.commit()
    return {"message": "Department deleted successfully"}