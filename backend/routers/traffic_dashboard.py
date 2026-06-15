from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from services.traffic_dashboard_service import TrafficDashboardService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/traffic-dashboard", tags=["Traffic Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficDashboardService(db)
    return service.get_dashboard_stats()