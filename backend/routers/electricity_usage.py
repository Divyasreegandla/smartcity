from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from database.database import get_db
from models.electricity_usage import ElectricityUsage
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
    db_usage = ElectricityUsage(**data.model_dump())
    db.add(db_usage)
    db.commit()
    db.refresh(db_usage)
    return db_usage

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
    query = db.query(ElectricityUsage)
    if area_name:
        query = query.filter(ElectricityUsage.area_name.ilike(f"%{area_name}%"))
    if start_date:
        query = query.filter(ElectricityUsage.usage_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(ElectricityUsage.usage_date <= datetime.combine(end_date, datetime.max.time()))
    
    return query.order_by(ElectricityUsage.usage_date.desc()).offset(skip).limit(limit).all()

@router.get("/area/{area_name}")
def get_area_usage_summary(
    area_name: str,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get area-wise usage report"""
    from datetime import timedelta
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    records = db.query(ElectricityUsage).filter(
        ElectricityUsage.area_name.ilike(f"%{area_name}%"),
        ElectricityUsage.usage_date >= start_date,
        ElectricityUsage.usage_date <= end_date
    ).all()
    
    total_units = sum(r.units_consumed for r in records)
    avg_peak_load = sum(r.peak_load for r in records) / len(records) if records else 0
    
    return {
        "area_name": area_name,
        "days": days,
        "total_units_consumed": round(total_units, 2),
        "average_peak_load": round(avg_peak_load, 2),
        "records_count": len(records),
        "daily_breakdown": [
            {"date": r.usage_date.date().isoformat(), "units": round(r.units_consumed, 2), "peak_load": round(r.peak_load, 2)}
            for r in records
        ]
    }