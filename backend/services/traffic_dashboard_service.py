from sqlalchemy.orm import Session
from typing import Dict
from services.traffic_signal_service import TrafficSignalService
from services.traffic_incident_service import TrafficIncidentService
from services.congestion_service import CongestionService
from services.road_maintenance_service import RoadMaintenanceService
from services.traffic_violation_service import TrafficViolationService


class TrafficDashboardService:
    def __init__(self, db: Session):
        self.db = db
        self.signal_service = TrafficSignalService(db)
        self.incident_service = TrafficIncidentService(db)
        self.congestion_service = CongestionService(db)
        self.maintenance_service = RoadMaintenanceService(db)
        self.violation_service = TrafficViolationService(db)

    def get_dashboard_stats(self) -> Dict:
        signal_stats = self.signal_service.get_dashboard_stats()
        incident_stats = self.incident_service.get_dashboard_stats()
        maintenance_stats = self.maintenance_service.get_dashboard_stats()
        violation_stats = self.violation_service.get_dashboard_stats()
        
        high_congestion = self.congestion_service.get_high_congestion_areas()

        return {
            "total_traffic_signals": signal_stats["total"],
            "active_incidents": incident_stats["active"],
            "high_congestion_areas": len(high_congestion),
            "roads_under_maintenance": maintenance_stats["in_progress"],
            "traffic_violations_today": self.violation_service.get_today_count(),
            "fine_revenue_collected": round(self.violation_service.get_total_fine_collected(), 2),
            "signal_status_breakdown": {
                "red": signal_stats["red"],
                "yellow": signal_stats["yellow"],
                "green": signal_stats["green"]
            },
            "incident_breakdown": {
                "total": incident_stats["total"],
                "resolved": incident_stats["resolved"]
            },
            "maintenance_breakdown": {
                "planned": maintenance_stats["planned"],
                "in_progress": maintenance_stats["in_progress"],
                "completed": maintenance_stats["completed"]
            },
            "violation_breakdown": {
                "total": violation_stats["total"],
                "paid": violation_stats["paid"],
                "pending": violation_stats["pending"]
            }
        }