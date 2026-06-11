from typing import Optional, List
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.waste_collection_logs import WasteCollectionLog
from .base_repository import BaseRepository


class WasteCollectionRepository(BaseRepository[WasteCollectionLog]):
    def __init__(self, db: Session):
        super().__init__(WasteCollectionLog, db)

    def get_by_route_id(self, route_id: int, skip: int = 0, limit: int = 100) -> List[WasteCollectionLog]:
        """Get collection logs by route"""
        return self.db.query(WasteCollectionLog).filter(
            WasteCollectionLog.route_id == route_id
        ).order_by(WasteCollectionLog.collection_date.desc()).offset(skip).limit(limit).all()

    def get_by_vehicle_id(self, vehicle_id: int, skip: int = 0, limit: int = 100) -> List[WasteCollectionLog]:
        """Get collection logs by vehicle"""
        return self.db.query(WasteCollectionLog).filter(
            WasteCollectionLog.vehicle_id == vehicle_id
        ).order_by(WasteCollectionLog.collection_date.desc()).offset(skip).limit(limit).all()

    def get_by_date_range(
        self,
        start_date: date,
        end_date: date,
        route_id: Optional[int] = None,
        vehicle_id: Optional[int] = None
    ) -> List[WasteCollectionLog]:
        """Get collection logs within date range"""
        query = self.db.query(WasteCollectionLog).filter(
            WasteCollectionLog.collection_date >= datetime.combine(start_date, datetime.min.time()),
            WasteCollectionLog.collection_date <= datetime.combine(end_date, datetime.max.time())
        )
        if route_id:
            query = query.filter(WasteCollectionLog.route_id == route_id)
        if vehicle_id:
            query = query.filter(WasteCollectionLog.vehicle_id == vehicle_id)
        return query.order_by(WasteCollectionLog.collection_date).all()

    def get_daily_total(self, collection_date: date) -> dict:
        """Get daily collection summary"""
        date_start = datetime.combine(collection_date, datetime.min.time())
        date_end = datetime.combine(collection_date, datetime.max.time())
        
        logs = self.db.query(WasteCollectionLog).filter(
            WasteCollectionLog.collection_date >= date_start,
            WasteCollectionLog.collection_date <= date_end
        ).all()
        
        total_weight = sum(log.collected_weight_kg for log in logs)
        
        return {
            "date": collection_date.isoformat(),
            "total_collections": len(logs),
            "total_weight_kg": total_weight,
            "average_weight_kg": total_weight / len(logs) if logs else 0
        }

    def get_weekly_trend(self) -> List[dict]:
        """Get weekly collection trend"""
        trend = []
        end_date = datetime.now().date()
        
        for i in range(6, -1, -1):
            target_date = end_date - timedelta(days=i)
            daily_summary = self.get_daily_total(target_date)
            trend.append({
                "date": target_date.isoformat(),
                "day": target_date.strftime("%a"),
                "weight_kg": daily_summary["total_weight_kg"],
                "collections": daily_summary["total_collections"]
            })
        
        return trend

    def get_route_performance(self, days: int = 30) -> List[dict]:
        """Get route performance statistics"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        logs = self.get_by_date_range(start_date.date(), end_date.date())
        
        route_stats = {}
        for log in logs:
            if log.route_id not in route_stats:
                route_stats[log.route_id] = {
                    "total_weight": 0,
                    "collection_count": 0,
                    "dates": set()
                }
            route_stats[log.route_id]["total_weight"] += log.collected_weight_kg
            route_stats[log.route_id]["collection_count"] += 1
            route_stats[log.route_id]["dates"].add(log.collection_date.date())
        
        result = []
        for route_id, stats in route_stats.items():
            result.append({
                "route_id": route_id,
                "total_weight_kg": round(stats["total_weight"], 2),
                "collection_count": stats["collection_count"],
                "unique_days": len(stats["dates"]),
                "avg_weight_per_collection": round(stats["total_weight"] / stats["collection_count"], 2) if stats["collection_count"] > 0 else 0
            })
        
        return sorted(result, key=lambda x: x["total_weight_kg"], reverse=True)

    def get_vehicle_performance(self, days: int = 30) -> List[dict]:
        """Get vehicle performance statistics"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        logs = self.get_by_date_range(start_date.date(), end_date.date())
        
        vehicle_stats = {}
        for log in logs:
            if log.vehicle_id not in vehicle_stats:
                vehicle_stats[log.vehicle_id] = {
                    "total_weight": 0,
                    "collection_count": 0
                }
            vehicle_stats[log.vehicle_id]["total_weight"] += log.collected_weight_kg
            vehicle_stats[log.vehicle_id]["collection_count"] += 1
        
        result = []
        for vehicle_id, stats in vehicle_stats.items():
            result.append({
                "vehicle_id": vehicle_id,
                "total_weight_kg": round(stats["total_weight"], 2),
                "collection_count": stats["collection_count"],
                "avg_weight_per_collection": round(stats["total_weight"] / stats["collection_count"], 2) if stats["collection_count"] > 0 else 0
            })
        
        return sorted(result, key=lambda x: x["total_weight_kg"], reverse=True)