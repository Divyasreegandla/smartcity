from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from services.power_service import PowerService
from schemas.electricity_usage_schemas import ElectricityUsageCreate, ElectricityUsageResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/electricity-usage", tags=["Electricity Usage"])


@router.post("/", response_model=ElectricityUsageResponse, status_code=status.HTTP_201_CREATED)
def create_usage_record(
    data: ElectricityUsageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Add daily electricity usage record (Admin only)"""
    service = PowerService(db)
    usage = service.create_usage_record(data)
    return usage


@router.get("/", response_model=List[ElectricityUsageResponse])
def get_usage_records(
    skip: int = 0,
    limit: int = 100,
    area_name: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get electricity usage records with filters"""
    service = PowerService(db)
    return service.get_usage_records(skip, limit, area_name, start_date, end_date)


@router.get("/area/{area_name}")
def get_area_usage_summary(
    area_name: str,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get area-wise usage report"""
    service = PowerService(db)
    return service.get_area_usage_summary(area_name, days)