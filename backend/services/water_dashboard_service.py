from sqlalchemy.orm import Session
from typing import Dict
from datetime import datetime, timedelta
from models.water_zones import WaterZone, ZoneStatus
from models.water_tanks import WaterTank
from models.water_supply_schedules import WaterSupplySchedule, SupplyStatus
from models.water_leak_reports import WaterLeakReport, LeakStatus
from models.water_consumption import WaterConsumption

class WaterDashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self) -> Dict:
        """Get main dashboard statistics"""
        
        total_zones = self.db.query(WaterZone).count()
        active_zones = self.db.query(WaterZone).filter(WaterZone.status == ZoneStatus.ACTIVE).count()
        
        total_tanks = self.db.query(WaterTank).count()
        
        today = datetime.now().date()
        supply_today = self.db.query(WaterSupplySchedule).filter(
            WaterSupplySchedule.supply_date >= today,
            WaterSupplySchedule.supply_status == SupplyStatus.SCHEDULED
        ).count()
        
        pending_leaks = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.REPORTED
        ).count()
        
        today_start = datetime(today.year, today.month, today.day)
        total_consumption = self.db.query(WaterConsumption).filter(
            WaterConsumption.consumption_date >= today_start
        ).all()
        total_liters = sum(c.total_liters_consumed for c in total_consumption)
        
        return {
            "total_water_zones": total_zones,
            "active_water_zones": active_zones,
            "total_water_tanks": total_tanks,
            "water_supply_today": supply_today,
            "pending_leakage_reports": pending_leaks,
            "total_consumption_today_liters": total_liters
        }

    def get_weekly_consumption_trend(self) -> Dict:
        """Get weekly water consumption trend"""
        weekly_data = []
        today = datetime.now().date()
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            date_start = datetime(date.year, date.month, date.day)
            date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
            
            consumption = self.db.query(WaterConsumption).filter(
                WaterConsumption.consumption_date >= date_start,
                WaterConsumption.consumption_date <= date_end
            ).all()
            
            total = sum(c.total_liters_consumed for c in consumption)
            weekly_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": date.strftime("%a"),
                "total_liters": total
            })
        
        return {
            "weekly_consumption": weekly_data,
            "total_weekly_consumption": sum(d["total_liters"] for d in weekly_data)
        }

    def get_zone_wise_consumption(self) -> Dict:
        """Get consumption breakdown by zone"""
        zones = self.db.query(WaterZone).all()
        today = datetime.now().date()
        today_start = datetime(today.year, today.month, today.day)
        
        zone_data = []
        for zone in zones:
            consumption = self.db.query(WaterConsumption).filter(
                WaterConsumption.zone_id == zone.id,
                WaterConsumption.consumption_date >= today_start
            ).first()
            
            zone_data.append({
                "zone_id": zone.id,
                "zone_name": zone.zone_name,
                "zone_code": zone.zone_code,
                "population": zone.population,
                "today_consumption_liters": consumption.total_liters_consumed if consumption else 0,
                "per_capita_consumption": (consumption.total_liters_consumed / zone.population) if consumption and zone.population > 0 else 0
            })
        
        return {
            "zones": zone_data,
            "last_updated": datetime.now().isoformat()
        }

    def get_leakage_summary(self) -> Dict:
        """Get leakage reports summary"""
        total_reports = self.db.query(WaterLeakReport).count()
        
        reported = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.REPORTED
        ).count()
        
        under_review = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.UNDER_REVIEW
        ).count()
        
        in_progress = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.IN_PROGRESS
        ).count()
        
        resolved = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.RESOLVED
        ).count()
        
        rejected = self.db.query(WaterLeakReport).filter(
            WaterLeakReport.status == LeakStatus.REJECTED
        ).count()
        
        # Calculate resolution rate
        resolved_or_closed = resolved + rejected
        resolution_rate = (resolved_or_closed / total_reports * 100) if total_reports > 0 else 0
        
        return {
            "total_reports": total_reports,
            "reported": reported,
            "under_review": under_review,
            "in_progress": in_progress,
            "resolved": resolved,
            "rejected": rejected,
            "resolution_rate": round(resolution_rate, 1)
        }