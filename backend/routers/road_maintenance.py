from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.road_maintenance_service import RoadMaintenanceService
from schemas.road_maintenance_schemas import RoadMaintenanceCreate, RoadMaintenanceUpdate, RoadMaintenanceResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/road-maintenance", tags=["Road Maintenance"])


@router.post("/", response_model=RoadMaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    data: RoadMaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = RoadMaintenanceService(db)
    maintenance = service.create_maintenance(data)
    return maintenance


@router.get("/", response_model=List[RoadMaintenanceResponse])
def get_maintenance_records(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by status (planned, in_progress, completed, cancelled)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RoadMaintenanceService(db)
    return service.get_all_maintenance(skip, limit, status)


@router.get("/active")
def get_active_maintenance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RoadMaintenanceService(db)
    return service.get_active_maintenance()


@router.put("/{maintenance_id}", response_model=RoadMaintenanceResponse)
def update_maintenance(
    maintenance_id: int,
    data: RoadMaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = RoadMaintenanceService(db)
    maintenance = service.update_maintenance(maintenance_id, data)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return maintenance