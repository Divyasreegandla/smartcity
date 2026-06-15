from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from services.congestion_service import CongestionService
from schemas.congestion_schemas import CongestionReportCreate, CongestionReportResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/congestion-reports", tags=["Congestion Reports"])


@router.post("/", response_model=CongestionReportResponse, status_code=status.HTTP_201_CREATED)
def create_congestion_report(
    data: CongestionReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = CongestionService(db)
    report = service.create_report(data)
    return report


@router.get("/", response_model=List[CongestionReportResponse])
def get_congestion_reports(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CongestionService(db)
    return service.get_all_reports(skip, limit)


@router.get("/area/{area_name}")
def get_area_congestion(
    area_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CongestionService(db)
    report = service.get_area_congestion(area_name)
    if not report:
        raise HTTPException(status_code=404, detail="No congestion data found for this area")
    return report


@router.get("/high-congestion/areas")
def get_high_congestion_areas(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CongestionService(db)
    return service.get_high_congestion_areas()