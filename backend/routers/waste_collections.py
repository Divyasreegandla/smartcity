from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from database.database import get_db
from models.waste_collection_logs import WasteCollectionLog
from models.collection_routes import CollectionRoute
from models.waste_vehicles import WasteVehicle
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
    route = db.query(CollectionRoute).filter(CollectionRoute.id == data.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db_log = WasteCollectionLog(**data.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    return {
        **db_log.__dict__,
        "route_name": route.route_name,
        "vehicle_number": vehicle.vehicle_number
    }

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
    query = db.query(WasteCollectionLog)
    if route_id:
        query = query.filter(WasteCollectionLog.route_id == route_id)
    if vehicle_id:
        query = query.filter(WasteCollectionLog.vehicle_id == vehicle_id)
    if start_date:
        query = query.filter(WasteCollectionLog.collection_date >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(WasteCollectionLog.collection_date <= datetime.combine(end_date, datetime.max.time()))
    
    logs = query.order_by(WasteCollectionLog.collection_date.desc()).offset(skip).limit(limit).all()
    
    result = []
    for log in logs:
        route = db.query(CollectionRoute).filter(CollectionRoute.id == log.route_id).first()
        vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == log.vehicle_id).first()
        result.append({
            **log.__dict__,
            "route_name": route.route_name if route else None,
            "vehicle_number": vehicle.vehicle_number if vehicle else None
        })
    return result

@router.get("/reports/daily")
def get_daily_report(
    report_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not report_date:
        report_date = datetime.now().date()
    
    date_start = datetime.combine(report_date, datetime.min.time())
    date_end = datetime.combine(report_date, datetime.max.time())
    
    logs = db.query(WasteCollectionLog).filter(
        WasteCollectionLog.collection_date >= date_start,
        WasteCollectionLog.collection_date <= date_end
    ).all()
    
    total_weight = sum(log.collected_weight_kg for log in logs)
    total_collections = len(logs)
    
    # Route-wise breakdown
    route_breakdown = {}
    for log in logs:
        route = db.query(CollectionRoute).filter(CollectionRoute.id == log.route_id).first()
        route_name = route.route_name if route else "Unknown"
        if route_name not in route_breakdown:
            route_breakdown[route_name] = {"collections": 0, "total_weight": 0}
        route_breakdown[route_name]["collections"] += 1
        route_breakdown[route_name]["total_weight"] += log.collected_weight_kg
    
    return {
        "date": report_date.isoformat(),
        "total_collections": total_collections,
        "total_weight_kg": total_weight,
        "average_collection_kg": total_weight / total_collections if total_collections > 0 else 0,
        "route_breakdown": route_breakdown
    }