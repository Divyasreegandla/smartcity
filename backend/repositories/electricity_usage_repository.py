from typing import Optional, List
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.electricity_usage import ElectricityUsage
from .base_repository import BaseRepository


class ElectricityUsageRepository(BaseRepository[ElectricityUsage]):
    def __init__(self, db: Session):
        super().__init__(ElectricityUsage, db)

    def get_by_area(self, area_name: str, skip: int = 0, limit: int = 100) -> List[ElectricityUsage]:
        """Get usage records by area"""
        return self.db.query(ElectricityUsage).filter(
            ElectricityUsage.area_name.ilike(f"%{area_name}%")
        ).order_by(ElectricityUsage.usage_date.desc()).offset(skip).limit(limit).all()

    def get_by_date_range(
        self,
        start_date: date,
        end_date: date,
        area_name: Optional[str] = None
    ) -> List[ElectricityUsage]:
        """Get usage records within date range"""
        query = self.db.query(ElectricityUsage).filter(
            ElectricityUsage.usage_date >= datetime.combine(start_date, datetime.min.time()),
            ElectricityUsage.usage_date <= datetime.combine(end_date, datetime.max.time())
        )
        if area_name:
            query = query.filter(ElectricityUsage.area_name.ilike(f"%{area_name}%"))
        return query.order_by(ElectricityUsage.usage_date).all()

    def get_today_consumption(self, area_name: Optional[str] = None) -> float:
        """Get today's total consumption"""
        today = date.today()
        query = self.db.query(func.sum(ElectricityUsage.units_consumed)).filter(
            ElectricityUsage.usage_date >= today
        )
        if area_name:
            query = query.filter(ElectricityUsage.area_name.ilike(f"%{area_name}%"))
        result = query.scalar()
        return result or 0

    def get_peak_load_areas(self, limit: int = 5) -> List[dict]:
        """Get areas with highest peak load"""
        records = self.db.query(ElectricityUsage).order_by(
            ElectricityUsage.peak_load.desc()
        ).limit(limit).all()
        
        return [
            {
                "area": r.area_name,
                "peak_load": r.peak_load,
                "date": r.usage_date.date().isoformat()
            }
            for r in records
        ]

    def get_area_ranking(self) -> List[dict]:
        """Get area-wise consumption ranking"""
        areas = {}
        all_usage = self.db.query(ElectricityUsage).all()
        
        for usage in all_usage:
            if usage.area_name not in areas:
                areas[usage.area_name] = 0
            areas[usage.area_name] += usage.units_consumed
        
        rankings = [{"area": area, "units_consumed": round(units, 2)} for area, units in areas.items()]
        rankings.sort(key=lambda x: x["units_consumed"], reverse=True)
        
        return rankings

    def get_weekly_trend(self) -> List[dict]:
        """Get weekly consumption trend"""
        trend = []
        end_date = datetime.now()
        
        for i in range(6, -1, -1):
            target_date = end_date - timedelta(days=i)
            date_start = datetime(target_date.year, target_date.month, target_date.day)
            date_end = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
            
            total = self.db.query(func.sum(ElectricityUsage.units_consumed)).filter(
                ElectricityUsage.usage_date >= date_start,
                ElectricityUsage.usage_date <= date_end
            ).scalar() or 0
            
            trend.append({
                "date": target_date.strftime("%Y-%m-%d"),
                "day": target_date.strftime("%a"),
                "units_consumed": round(total, 2)
            })
        
        return trend