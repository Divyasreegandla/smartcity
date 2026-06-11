from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from services.power_service import PowerService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/power-dashboard", tags=["Power Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get power dashboard statistics"""
    service = PowerService(db)
    return service.get_dashboard_stats()


@router.get("/consumption-trend")
def get_consumption_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consumption trend for charts"""
    service = PowerService(db)
    return service.get_consumption_trend(days)


@router.get("/area-ranking")
def get_area_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get area-wise consumption ranking"""
    service = PowerService(db)
    return service.get_area_ranking()


@router.get("/outage-stats")
def get_outage_statistics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get outage statistics"""
    service = PowerService(db)
    return service.get_outage_statistics(days)