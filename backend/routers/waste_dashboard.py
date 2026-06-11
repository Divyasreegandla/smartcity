from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from services.waste_service import WasteManagementService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/waste-dashboard", tags=["Waste Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_dashboard_stats()


@router.get("/collection-trend")
def get_collection_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_collection_trend(days)


@router.get("/bin-status-summary")
def get_bin_status_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_bin_status_summary()


@router.get("/route-performance")
def get_route_performance(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return {"route_performance": service.get_route_performance(days)}


@router.get("/vehicle-utilization")
def get_vehicle_utilization(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return {"vehicles": service.get_vehicle_utilization()}