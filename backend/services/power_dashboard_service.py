from sqlalchemy.orm import Session
from typing import Dict, List
from datetime import datetime, timedelta
from models.substations import Substation, SubstationStatus
from models.transformers import Transformer, TransformerStatus
from models.electricity_usage import ElectricityUsage
from models.power_outages import PowerOutage, OutageStatus

class PowerDashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_dashboard_stats(self) -> Dict:
        """Get main dashboard statistics"""
        
        # Substation stats
        total_substations = self.db.query(Substation).count()
        active_substations = self.db.query(Substation).filter(Substation.status == SubstationStatus.ACTIVE).count()
        
        # Transformer stats
        total_transformers = self.db.query(Transformer).count()
        active_transformers = self.db.query(Transformer).filter(Transformer.status == TransformerStatus.ACTIVE).count()
        fault_transformers = self.db.query(Transformer).filter(Transformer.status == TransformerStatus.FAULT).count()
        
        # Today's consumption
        today = datetime.now().date()
        today_start = datetime(today.year, today.month, today.day)
        today_usage = self.db.query(ElectricityUsage).filter(
            ElectricityUsage.usage_date >= today_start
        ).all()
        total_consumption = sum(u.units_consumed for u in today_usage)
        
        # Active outages
        active_outages = self.db.query(PowerOutage).filter(
            PowerOutage.status.in_([OutageStatus.REPORTED, OutageStatus.IN_PROGRESS])
        ).count()
        
        # Maintenance due (transformers in maintenance status)
        maintenance_due = self.db.query(Transformer).filter(
            Transformer.status == TransformerStatus.MAINTENANCE
        ).count()
        
        # Peak load areas
        peak_load_areas = self.db.query(ElectricityUsage).order_by(
            ElectricityUsage.peak_load.desc()
        ).limit(5).all()
        
        # Calculate total capacity
        total_capacity_mw = sum(s.capacity_mw for s in self.db.query(Substation).all())
        
        return {
            "total_substations": total_substations,
            "active_substations": active_substations,
            "total_transformers": total_transformers,
            "active_transformers": active_transformers,
            "fault_transformers": fault_transformers,
            "total_capacity_mw": total_capacity_mw,
            "today_consumption_kwh": round(total_consumption, 2),
            "active_outages": active_outages,
            "maintenance_due_count": maintenance_due,
            "peak_load_areas": [
                {
                    "area": u.area_name,
                    "peak_load": round(u.peak_load, 2),
                    "date": u.usage_date.date().isoformat()
                }
                for u in peak_load_areas
            ]
        }

    def get_weekly_trend(self) -> Dict:
        """Get weekly consumption trend"""
        weekly_data = []
        today = datetime.now().date()
        
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            date_start = datetime(date.year, date.month, date.day)
            date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
            
            consumption = self.db.query(ElectricityUsage).filter(
                ElectricityUsage.usage_date >= date_start,
                ElectricityUsage.usage_date <= date_end
            ).all()
            
            total = sum(u.units_consumed for u in consumption)
            weekly_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": date.strftime("%a"),
                "units_consumed": round(total, 2)
            })
        
        return {
            "weekly_consumption": weekly_data,
            "total_weekly_consumption": round(sum(d["units_consumed"] for d in weekly_data), 2)
        }

    def get_area_rankings(self) -> Dict:
        """Get area-wise consumption rankings"""
        areas = {}
        all_usage = self.db.query(ElectricityUsage).all()
        
        for usage in all_usage:
            if usage.area_name not in areas:
                areas[usage.area_name] = {
                    "total_units": 0,
                    "avg_peak_load": 0,
                    "count": 0,
                    "peak_load_sum": 0
                }
            areas[usage.area_name]["total_units"] += usage.units_consumed
            areas[usage.area_name]["peak_load_sum"] += usage.peak_load
            areas[usage.area_name]["count"] += 1
        
        # Calculate averages and create rankings
        rankings = []
        for area, data in areas.items():
            rankings.append({
                "area": area,
                "total_units": round(data["total_units"], 2),
                "avg_peak_load": round(data["peak_load_sum"] / data["count"], 2) if data["count"] > 0 else 0,
                "records": data["count"]
            })
        
        rankings.sort(key=lambda x: x["total_units"], reverse=True)
        
        return {
            "rankings": rankings[:10],
            "last_updated": datetime.now().isoformat()
        }

    def get_outage_summary(self) -> Dict:
        """Get outage summary for dashboard"""
        total_outages = self.db.query(PowerOutage).count()
        resolved_outages = self.db.query(PowerOutage).filter(PowerOutage.status == OutageStatus.RESOLVED).count()
        
        # Calculate average resolution time for last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_resolved = self.db.query(PowerOutage).filter(
            PowerOutage.status == OutageStatus.RESOLVED,
            PowerOutage.outage_end_time >= thirty_days_ago
        ).all()
        
        avg_resolution_hours = 0
        if recent_resolved:
            total_hours = sum((o.outage_end_time - o.outage_start_time).total_seconds() / 3600 for o in recent_resolved)
            avg_resolution_hours = total_hours / len(recent_resolved)
        
        return {
            "total_outages": total_outages,
            "resolved_outages": resolved_outages,
            "pending_outages": total_outages - resolved_outages,
            "resolution_rate": round((resolved_outages / total_outages * 100), 1) if total_outages > 0 else 0,
            "avg_resolution_hours": round(avg_resolution_hours, 1),
            "outages_by_status": {
                "reported": self.db.query(PowerOutage).filter(PowerOutage.status == OutageStatus.REPORTED).count(),
                "in_progress": self.db.query(PowerOutage).filter(PowerOutage.status == OutageStatus.IN_PROGRESS).count(),
                "resolved": resolved_outages,
                "cancelled": self.db.query(PowerOutage).filter(PowerOutage.status == OutageStatus.CANCELLED).count()
            }
        }