from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.database import get_db
from models.waste_vehicles import WasteVehicle, VehicleStatus
from models.collection_routes import CollectionRoute, RouteStatus
from models.waste_bins import WasteBin, BinStatus
from models.waste_collection_logs import WasteCollectionLog
from models.sanitation_workers import SanitationWorker, WorkerStatus
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/waste-dashboard", tags=["Waste Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_vehicles = db.query(WasteVehicle).count()
    active_vehicles = db.query(WasteVehicle).filter(WasteVehicle.status == VehicleStatus.ACTIVE).count()
    
    total_routes = db.query(CollectionRoute).count()
    active_routes = db.query(CollectionRoute).filter(CollectionRoute.status == RouteStatus.ACTIVE).count()
    
    total_bins = db.query(WasteBin).count()
    full_bins = db.query(WasteBin).filter(
        WasteBin.status.in_([BinStatus.FULL, BinStatus.OVERFLOWING])
    ).count()
    
    total_workers = db.query(SanitationWorker).count()
    active_workers = db.query(SanitationWorker).filter(SanitationWorker.status == WorkerStatus.ACTIVE).count()
    
    # Today's collection
    today = datetime.now().date()
    today_start = datetime.combine(today, datetime.min.time())
    today_collections = db.query(WasteCollectionLog).filter(
        WasteCollectionLog.collection_date >= today_start
    ).all()
    daily_weight = sum(c.collected_weight_kg for c in today_collections)
    
    return {
        "total_vehicles": total_vehicles,
        "active_vehicles": active_vehicles,
        "total_routes": total_routes,
        "active_routes": active_routes,
        "total_bins": total_bins,
        "full_bins": full_bins,
        "total_workers": total_workers,
        "active_workers": active_workers,
        "daily_collection_kg": daily_weight
    }

@router.get("/collection-trend")
def get_collection_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trend = []
    end_date = datetime.now()
    
    for i in range(days - 1, -1, -1):
        date = end_date - timedelta(days=i)
        date_start = datetime.combine(date.date(), datetime.min.time())
        date_end = datetime.combine(date.date(), datetime.max.time())
        
        collections = db.query(WasteCollectionLog).filter(
            WasteCollectionLog.collection_date >= date_start,
            WasteCollectionLog.collection_date <= date_end
        ).all()
        
        total_weight = sum(c.collected_weight_kg for c in collections)
        trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "day": date.strftime("%a"),
            "weight_kg": total_weight,
            "collections": len(collections)
        })
    
    return {"trend": trend, "total_weekly_weight": sum(t["weight_kg"] for t in trend)}