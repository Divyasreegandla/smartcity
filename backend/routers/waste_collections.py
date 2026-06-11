from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database.database import get_db
from services.waste_service import WasteManagementService
from schemas.waste_collection_schemas import WasteCollectionCreate, WasteCollectionResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/waste-collections", tags=["Waste collection"])


@router.post("/", response_model=WasteCollectionResponse, status_code=status.HTTP_201_CREATED)
def create_collection_log(
    data: WasteCollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WasteManagementService(db)
    log, error = service.create_collection_log(data)
    
    if error:
        raise HTTPException(status_code=404, detail=error)
    
    return log


@router.get("/", response_model=List[WasteCollectionResponse])
def get_collection_logs(
    skip: int = 0,
    limit: int = 100,
    route_id: Optional[int] = None,
    vehicle_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_collection_logs(skip, limit, route_id, vehicle_id, start_date, end_date)


@router.get("/reports/daily")
def get_daily_report(
    report_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_daily_collection_report(report_date)