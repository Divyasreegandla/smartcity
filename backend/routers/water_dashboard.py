from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from services.water_dashboard_service import WaterDashboardService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/water-dashboard", tags=["Water Supply"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get water supply dashboard statistics"""
    service = WaterDashboardService(db)
    return service.get_dashboard_stats()

@router.get("/weekly-trend")
def get_weekly_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get weekly water consumption trend"""
    service = WaterDashboardService(db)
    return service.get_weekly_consumption_trend()

@router.get("/zone-consumption")
def get_zone_wise_consumption(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get zone-wise water consumption"""
    service = WaterDashboardService(db)
    return service.get_zone_wise_consumption()

@router.get("/leakage-summary")
def get_leakage_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leakage reports summary"""
    service = WaterDashboardService(db)
    return service.get_leakage_summary()