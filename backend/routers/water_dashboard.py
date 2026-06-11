from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime, date, timedelta
from database.database import get_db
from services.water_service import WaterService
from utils.auth_utils import get_current_user
from models.users import User

router = APIRouter(prefix="/water-dashboard", tags=["Water Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get water supply dashboard statistics
    
    Returns:
    - Total water zones and active zones
    - Total water tanks
    - Water supply schedule for today
    - Pending leakage reports
    - Today's total water consumption
    """
    service = WaterService(db)
    return service.get_dashboard_stats()


@router.get("/weekly-trend")
def get_weekly_trend(
    zone_id: Optional[int] = Query(None, description="Filter by zone ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get weekly water consumption trend
    
    Optional:
    - zone_id: Filter consumption for a specific zone
    """
    service = WaterService(db)
    trend = service.get_weekly_trend()
    
    if zone_id:
        # Filter trend for specific zone
        zone_trend = service.consumption_repo.get_weekly_trend(zone_id)
        return {
            "zone_id": zone_id,
            "weekly_consumption": zone_trend,
            "total_weekly_consumption": sum(day["total_liters"] for day in zone_trend)
        }
    
    return {
        "weekly_consumption": trend,
        "total_weekly_consumption": sum(day["total_liters"] for day in trend)
    }


@router.get("/zone-consumption")
def get_zone_wise_consumption(
    date_filter: Optional[date] = Query(None, description="Filter by specific date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get zone-wise water consumption breakdown
    
    Optional:
    - date_filter: Show consumption for a specific date (default: today)
    """
    service = WaterService(db)
    zones = service.get_all_zones()
    
    target_date = date_filter or date.today()
    zone_data = []
    
    for zone in zones:
        consumption = service.consumption_repo.get_zone_today_consumption(zone.id)
        
        # Calculate per capita consumption
        per_capita = consumption / zone.population if zone.population > 0 else 0
        
        # Get fill status of tanks in this zone (if relationship exists)
        tanks = service.tank_repo.get_all()
        zone_tanks = [t for t in tanks if t.location and zone.area_name.lower() in t.location.lower()]
        
        zone_data.append({
            "zone_id": zone.id,
            "zone_name": zone.zone_name,
            "zone_code": zone.zone_code,
            "area_name": zone.area_name,
            "population": zone.population,
            "status": zone.status.value,
            "today_consumption_liters": round(consumption, 2),
            "per_capita_consumption_liters": round(per_capita, 2),
            "tank_count": len(zone_tanks),
            "tank_status_summary": {
                "full": len([t for t in zone_tanks if t.status.value == "full"]),
                "partial": len([t for t in zone_tanks if t.status.value == "partial"]),
                "low": len([t for t in zone_tanks if t.status.value == "low"]),
                "critical": len([t for t in zone_tanks if t.status.value == "critical"])
            } if zone_tanks else {}
        })
    
    # Sort by consumption (highest first)
    zone_data.sort(key=lambda x: x["today_consumption_liters"], reverse=True)
    
    return {
        "zones": zone_data,
        "date": target_date.isoformat(),
        "total_consumption_today": round(sum(z["today_consumption_liters"] for z in zone_data), 2),
        "last_updated": datetime.now().isoformat()
    }


@router.get("/leakage-summary")
def get_leakage_summary(
    days: int = Query(30, description="Number of days for trend analysis", ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get leakage reports summary with trends
    
    Returns:
    - Total reports by status
    - Resolution rate
    - Recent trend (last N days)
    - Zone-wise breakdown
    """
    service = WaterService(db)
    
    # Get all leak reports
    all_reports = service.leak_repo.get_all()
    
    # Status breakdown
    status_counts = {
        "reported": 0,
        "under_review": 0,
        "in_progress": 0,
        "resolved": 0,
        "rejected": 0
    }
    
    zone_breakdown = {}
    recent_reports = []
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    for report in all_reports:
        # Count by status
        status_counts[report.status.value] = status_counts.get(report.status.value, 0) + 1
        
        # Zone breakdown
        zone = service.zone_repo.get_by_id(report.zone_id)
        zone_name = zone.zone_name if zone else "Unknown"
        if zone_name not in zone_breakdown:
            zone_breakdown[zone_name] = {"total": 0, "resolved": 0}
        zone_breakdown[zone_name]["total"] += 1
        if report.status.value == "resolved":
            zone_breakdown[zone_name]["resolved"] += 1
        
        # Recent reports for trend
        if report.created_at >= cutoff_date:
            recent_reports.append(report)
    
    total_reports = len(all_reports)
    resolved_reports = status_counts["resolved"] + status_counts["rejected"]
    resolution_rate = (resolved_reports / total_reports * 100) if total_reports > 0 else 0
    
    # Daily trend for last N days
    trend = []
    for i in range(days - 1, -1, -1):
        target_date = datetime.now() - timedelta(days=i)
        date_start = datetime(target_date.year, target_date.month, target_date.day)
        date_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
        
        daily_reports = service.leak_repo.get_by_date_range(date_start.date(), date_end.date())
        daily_resolved = len([r for r in daily_reports if r.status.value == "resolved"])
        
        trend.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "reported": len(daily_reports),
            "resolved": daily_resolved
        })
    
    return {
        "summary": {
            "total_reports": total_reports,
            "reported": status_counts["reported"],
            "under_review": status_counts["under_review"],
            "in_progress": status_counts["in_progress"],
            "resolved": status_counts["resolved"],
            "rejected": status_counts["rejected"],
            "resolution_rate": round(resolution_rate, 1),
            "pending": status_counts["reported"] + status_counts["under_review"] + status_counts["in_progress"]
        },
        "zone_breakdown": [
            {
                "zone": zone,
                "total": data["total"],
                "resolved": data["resolved"],
                "resolution_rate": round(data["resolved"] / data["total"] * 100, 1) if data["total"] > 0 else 0
            }
            for zone, data in sorted(zone_breakdown.items(), key=lambda x: x[1]["total"], reverse=True)
        ],
        "trend": trend,
        "analysis_period_days": days,
        "last_updated": datetime.now().isoformat()
    }


@router.get("/tank-status")
def get_tank_status_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get water tank status summary
    
    Returns:
    - Overall tank statistics
    - Tanks by status
    - Critical tanks requiring attention
    """
    service = WaterService(db)
    tanks = service.get_all_tanks()
    
    total_capacity = sum(t.capacity_liters for t in tanks)
    total_current = sum(t.current_level for t in tanks)
    overall_fill_percentage = (total_current / total_capacity * 100) if total_capacity > 0 else 0
    
    status_counts = {}
    for status in ["full", "partial", "low", "critical", "maintenance"]:
        status_counts[status] = len([t for t in tanks if t.status.value == status])
    
    # Tanks needing attention (low or critical)
    critical_tanks = [
        {
            "id": t.id,
            "tank_name": t.tank_name,
            "location": t.location,
            "current_level": t.current_level,
            "capacity_liters": t.capacity_liters,
            "fill_percentage": round((t.current_level / t.capacity_liters) * 100, 2),
            "status": t.status.value
        }
        for t in tanks if t.status.value in ["low", "critical"]
    ]
    
    return {
        "total_tanks": len(tanks),
        "total_capacity_liters": total_capacity,
        "total_current_liters": total_current,
        "overall_fill_percentage": round(overall_fill_percentage, 2),
        "status_breakdown": status_counts,
        "critical_tanks": critical_tanks,
        "critical_count": len(critical_tanks)
    }


@router.get("/supply-status")
def get_supply_status(
    date_filter: Optional[date] = Query(None, description="Filter by specific date"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get water supply schedule status
    
    Returns:
    - Today's/selected date supply schedules
    - Upcoming schedules
    - Completed schedules
    """
    service = WaterService(db)
    target_date = date_filter or date.today()
    
    schedules = service.schedule_repo.get_by_date(target_date)
    
    scheduled = []
    in_progress = []
    completed = []
    cancelled = []
    
    for schedule in schedules:
        zone = service.zone_repo.get_by_id(schedule.zone_id)
        schedule_data = {
            "id": schedule.id,
            "zone_id": schedule.zone_id,
            "zone_name": zone.zone_name if zone else "Unknown",
            "zone_code": zone.zone_code if zone else "Unknown",
            "supply_date": schedule.supply_date.isoformat() if schedule.supply_date else None,
            "start_time": schedule.start_time.isoformat() if schedule.start_time else None,
            "end_time": schedule.end_time.isoformat() if schedule.end_time else None,
            "status": schedule.supply_status.value
        }
        
        if schedule.supply_status.value == "scheduled":
            scheduled.append(schedule_data)
        elif schedule.supply_status.value == "in_progress":
            in_progress.append(schedule_data)
        elif schedule.supply_status.value == "completed":
            completed.append(schedule_data)
        elif schedule.supply_status.value == "cancelled":
            cancelled.append(schedule_data)
    
    # Get upcoming schedules (next 7 days)
    upcoming = []
    for i in range(1, 8):
        future_date = target_date + timedelta(days=i)
        future_schedules = service.schedule_repo.get_by_date(future_date)
        for s in future_schedules:
            zone = service.zone_repo.get_by_id(s.zone_id)
            upcoming.append({
                "id": s.id,
                "zone_id": s.zone_id,
                "zone_name": zone.zone_name if zone else "Unknown",
                "supply_date": s.supply_date.isoformat() if s.supply_date else None,
                "start_time": s.start_time.isoformat() if s.start_time else None,
                "end_time": s.end_time.isoformat() if s.end_time else None,
                "status": s.supply_status.value
            })
    
    return {
        "date": target_date.isoformat(),
        "summary": {
            "total": len(schedules),
            "scheduled": len(scheduled),
            "in_progress": len(in_progress),
            "completed": len(completed),
            "cancelled": len(cancelled)
        },
        "scheduled": scheduled,
        "in_progress": in_progress,
        "completed": completed,
        "cancelled": cancelled,
        "upcoming_7_days": upcoming,
        "upcoming_count": len(upcoming)
    }


@router.get("/alerts")
def get_water_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get water management alerts
    
    Returns:
    - Critical tank levels
    - Pending leakage reports
    - Supply schedule issues
    """
    service = WaterService(db)
    
    alerts = []
    
    # Check critical tanks
    critical_tanks = service.tank_repo.get_critical_tanks()
    for tank in critical_tanks:
        fill_percentage = (tank.current_level / tank.capacity_liters) * 100
        alerts.append({
            "type": "critical_tank",
            "severity": "high",
            "message": f"Tank '{tank.tank_name}' has critically low level ({round(fill_percentage, 1)}% full)",
            "tank_id": tank.id,
            "location": tank.location,
            "timestamp": datetime.now().isoformat()
        })
    
    # Check pending leak reports
    pending_leaks = service.leak_repo.get_pending_count()
    if pending_leaks > 0:
        alerts.append({
            "type": "pending_leaks",
            "severity": "medium",
            "message": f"There are {pending_leaks} pending leakage reports requiring attention",
            "count": pending_leaks,
            "timestamp": datetime.now().isoformat()
        })
    
    # Check today's supply schedule issues
    today = date.today()
    today_schedules = service.schedule_repo.get_by_date(today)
    completed_count = len([s for s in today_schedules if s.supply_status.value == "completed"])
    scheduled_count = len([s for s in today_schedules if s.supply_status.value == "scheduled"])
    
    if scheduled_count > 0 and datetime.now().hour > 18:  # After 6 PM
        alerts.append({
            "type": "pending_schedules",
            "severity": "medium",
            "message": f"{scheduled_count} water supply schedules are still pending for today",
            "count": scheduled_count,
            "timestamp": datetime.now().isoformat()
        })
    
    return {
        "alerts": alerts,
        "total_alerts": len(alerts),
        "high_severity_count": len([a for a in alerts if a["severity"] == "high"]),
        "medium_severity_count": len([a for a in alerts if a["severity"] == "medium"]),
        "last_checked": datetime.now().isoformat()
    }


@router.get("/export-summary")
def export_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Export complete dashboard summary for reporting
    """
    service = WaterService(db)
    
    return {
        "exported_at": datetime.now().isoformat(),
        "stats": service.get_dashboard_stats(),
        "weekly_trend": service.get_weekly_trend(),
        "zone_consumption": get_zone_wise_consumption(db, current_user),
        "leakage_summary": get_leakage_summary(db, current_user),
        "tank_status": get_tank_status_summary(db, current_user),
        "supply_status": get_supply_status(db, current_user)
    }