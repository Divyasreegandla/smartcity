from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from services.department_service import DepartmentService
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
    service = DepartmentService(db)
    department, error = service.create_department(department_data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return department


@router.get("/", response_model=List[DepartmentResponse])
def get_departments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    return service.get_all_departments(skip, limit)


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    department = service.get_department_by_id(department_id)
    
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
    service = DepartmentService(db)
    department = service.update_department(department_id, department_data)
    
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    return department


@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = DepartmentService(db)
    deleted = service.delete_department(department_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Department not found")
    
    return {"message": "Department deleted successfully"}