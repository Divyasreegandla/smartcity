from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime, timedelta, date
from models.electricity_usage import ElectricityUsage
from schemas.electricity_usage_schemas import ElectricityUsageCreate

class ElectricityUsageService:
    def __init__(self, db: Session):
        self.db = db

    def create_usage_record(self, data: ElectricityUsageCreate) -> ElectricityUsage:
        """Add a new electricity usage record"""
        db_usage = ElectricityUsage(**data.model_dump())
        self.db.add(db_usage)
        self.db.commit()
        self.db.refresh(db_usage)
        return db_usage

    def get_all_usage_records(self, skip: int = 0, limit: int = 100, area_name: Optional[str] = None, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[ElectricityUsage]:
        """Get all usage records with filters"""
        query = self.db.query(ElectricityUsage)
        if area_name:
            query = query.filter(ElectricityUsage.area_name.ilike(f"%{area_name}%"))
        if start_date:
            query = query.filter(ElectricityUsage.usage_date >= datetime.combine(start_date, datetime.min.time()))
        if end_date:
            query = query.filter(ElectricityUsage.usage_date <= datetime.combine(end_date, datetime.max.time()))
        
        return query.order_by(ElectricityUsage.usage_date.desc()).offset(skip).limit(limit).all()

    def get_area_summary(self, area_name: str, days: int = 30) -> Dict:
        """Get consumption summary for a specific area"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        records = self.db.query(ElectricityUsage).filter(
            ElectricityUsage.area_name.ilike(f"%{area_name}%"),
            ElectricityUsage.usage_date >= start_date,
            ElectricityUsage.usage_date <= end_date
        ).all()
        
        if not records:
            return {
                "area_name": area_name,
                "days": days,
                "total_units_consumed": 0,
                "average_peak_load": 0,
                "records_count": 0,
                "daily_breakdown": []
            }
        
        total_units = sum(r.units_consumed for r in records)
        avg_peak_load = sum(r.peak_load for r in records) / len(records)
        
        return {
            "area_name": area_name,
            "days": days,
            "total_units_consumed": round(total_units, 2),
            "average_peak_load": round(avg_peak_load, 2),
            "records_count": len(records),
            "daily_breakdown": [
                {
                    "date": r.usage_date.date().isoformat(),
                    "units": round(r.units_consumed, 2),
                    "peak_load": round(r.peak_load, 2)
                }
                for r in records
            ]
        }

    def get_consumption_trend(self, days: int = 7) -> List[Dict]:
        """Get consumption trend for dashboard"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        trend = []
        for i in range(days):
            date = end_date - timedelta(days=i)
            date_start = datetime(date.year, date.month, date.day)
            date_end = datetime(date.year, date.month, date.day, 23, 59, 59)
            
            usage = self.db.query(ElectricityUsage).filter(
                ElectricityUsage.usage_date >= date_start,
                ElectricityUsage.usage_date <= date_end
            ).all()
            
            total = sum(u.units_consumed for u in usage)
            peak = max((u.peak_load for u in usage), default=0)
            
            trend.append({
                "date": date.strftime("%Y-%m-%d"),
                "day": date.strftime("%a"),
                "units_consumed": round(total, 2),
                "peak_load": round(peak, 2)
            })
        
        return trend

    def get_top_consuming_areas(self, limit: int = 5) -> List[Dict]:
        """Get top consuming areas"""
        today = datetime.now().date()
        today_start = datetime(today.year, today.month, today.day)
        
        records = self.db.query(ElectricityUsage).filter(
            ElectricityUsage.usage_date >= today_start
        ).all()
        
        area_consumption = {}
        for record in records:
            if record.area_name not in area_consumption:
                area_consumption[record.area_name] = 0
            area_consumption[record.area_name] += record.units_consumed
        
        sorted_areas = sorted(area_consumption.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return [
            {"area": area, "units_consumed": round(units, 2)}
            for area, units in sorted_areas
        ]