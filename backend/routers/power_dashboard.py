from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from database.database import get_db
from models.substations import Substation, SubstationStatus
from models.transformers import Transformer, TransformerStatus
from models.electricity_usage import ElectricityUsage
from models.power_outages import PowerOutage, OutageStatus
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/power-dashboard", tags=["Power Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get power dashboard statistics"""
    total_substations = db.query(Substation).count()
    active_substations = db.query(Substation).filter(Substation.status == SubstationStatus.ACTIVE).count()
    
    total_transformers = db.query(Transformer).count()
    active_transformers = db.query(Transformer).filter(Transformer.status == TransformerStatus.ACTIVE).count()
    fault_transformers = db.query(Transformer).filter(Transformer.status == TransformerStatus.FAULT).count()
    
    today = datetime.now().date()
    today_start = datetime(today.year, today.month, today.day)
    today_usage = db.query(ElectricityUsage).filter(
        ElectricityUsage.usage_date >= today_start
    ).all()
    total_consumption = sum(u.units_consumed for u in today_usage)
    
    active_outages = db.query(PowerOutage).filter(
        PowerOutage.status.in_([OutageStatus.REPORTED, OutageStatus.IN_PROGRESS])
    ).count()
    
    maintenance_due = db.query(Transformer).filter(
        Transformer.status == TransformerStatus.MAINTENANCE
    ).count()
    
    peak_load_areas = db.query(ElectricityUsage).order_by(
        ElectricityUsage.peak_load.desc()
    ).limit(5).all()
    
    return {
        "total_substations": total_substations,
        "active_substations": active_substations,
        "total_transformers": total_transformers,
        "active_transformers": active_transformers,
        "fault_transformers": fault_transformers,
        "today_consumption_kwh": round(total_consumption, 2),
        "active_outages": active_outages,
        "maintenance_due_count": maintenance_due,
        "peak_load_areas": [
            {"area": u.area_name, "peak_load": round(u.peak_load, 2), "date": u.usage_date.date().isoformat()}
            for u in peak_load_areas
        ]
    }

@router.get("/consumption-trend")
def get_consumption_trend(
    days: int = 7,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get consumption trend for charts"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    trend = []
    for i in range(days):
        date = end_date - timedelta(days=i)
        date_start = datetime(date.year, date.month, date.day)
        date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
        
        usage = db.query(ElectricityUsage).filter(
            ElectricityUsage.usage_date >= date_start,
            ElectricityUsage.usage_date <= date_end
        ).all()
        
        total = sum(u.units_consumed for u in usage)
        trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "day": date.strftime("%a"),
            "units_consumed": round(total, 2)
        })
    
    return {"trend": trend, "total_consumption": round(sum(t["units_consumed"] for t in trend), 2)}

@router.get("/area-ranking")
def get_area_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get area-wise consumption ranking"""
    areas = {}
    all_usage = db.query(ElectricityUsage).all()
    
    for usage in all_usage:
        if usage.area_name not in areas:
            areas[usage.area_name] = 0
        areas[usage.area_name] += usage.units_consumed
    
    rankings = [{"area": area, "units_consumed": round(units, 2)} for area, units in areas.items()]
    rankings.sort(key=lambda x: x["units_consumed"], reverse=True)
    
    return {"rankings": rankings[:10]}