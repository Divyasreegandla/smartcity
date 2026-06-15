from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.traffic_violation_service import TrafficViolationService
from schemas.traffic_violation_schemas import TrafficViolationCreate, TrafficViolationUpdate, TrafficViolationResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/traffic-violations", tags=["Traffic Violations"])


@router.post("/", response_model=TrafficViolationResponse, status_code=status.HTTP_201_CREATED)
def create_violation(
    data: TrafficViolationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = TrafficViolationService(db)
    violation = service.create_violation(data, current_user.id)
    return violation


@router.get("/", response_model=List[TrafficViolationResponse])
def get_violations(
    skip: int = 0,
    limit: int = 100,
    vehicle_number: Optional[str] = Query(None, description="Filter by vehicle number"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficViolationService(db)
    return service.get_all_violations(skip, limit, vehicle_number, payment_status)


@router.get("/{violation_id}", response_model=TrafficViolationResponse)
def get_violation(
    violation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficViolationService(db)
    violation = service.get_violation_by_id(violation_id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation


@router.put("/{violation_id}", response_model=TrafficViolationResponse)
def update_violation(
    violation_id: int,
    data: TrafficViolationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = TrafficViolationService(db)
    violation = service.update_payment_status(violation_id, data.payment_status)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation