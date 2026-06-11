from typing import Optional, List
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.water_consumption import WaterConsumption
from .base_repository import BaseRepository


class WaterConsumptionRepository(BaseRepository[WaterConsumption]):
    def __init__(self, db: Session):
        super().__init__(WaterConsumption, db)

    def get_by_zone_id(self, zone_id: int, skip: int = 0, limit: int = 100) -> List[WaterConsumption]:
        """Get consumption records by zone"""
        return self.db.query(WaterConsumption).filter(
            WaterConsumption.zone_id == zone_id
        ).order_by(WaterConsumption.consumption_date.desc()).offset(skip).limit(limit).all()

    def get_by_date_range(
        self,
        start_date: date,
        end_date: date,
        zone_id: Optional[int] = None
    ) -> List[WaterConsumption]:
        """Get consumption records within date range"""
        query = self.db.query(WaterConsumption).filter(
            WaterConsumption.consumption_date >= start_date,
            WaterConsumption.consumption_date <= end_date
        )
        if zone_id:
            query = query.filter(WaterConsumption.zone_id == zone_id)
        return query.order_by(WaterConsumption.consumption_date).all()

    def get_daily_total(self, consumption_date: date) -> float:
        """Get total consumption for a specific date"""
        result = self.db.query(func.sum(WaterConsumption.total_liters_consumed)).filter(
            WaterConsumption.consumption_date >= consumption_date,
            WaterConsumption.consumption_date <= datetime(consumption_date.year, consumption_date.month, consumption_date.day, 23, 59, 59)
        ).scalar()
        return result or 0

    def get_zone_today_consumption(self, zone_id: int) -> float:
        """Get today's consumption for a zone"""
        today = date.today()
        result = self.db.query(func.sum(WaterConsumption.total_liters_consumed)).filter(
            WaterConsumption.zone_id == zone_id,
            WaterConsumption.consumption_date >= today
        ).scalar()
        return result or 0

    def get_weekly_trend(self, zone_id: Optional[int] = None) -> List[dict]:
        """Get weekly consumption trend"""
        weekly_data = []
        today = date.today()
        
        for i in range(6, -1, -1):
            from datetime import timedelta
            target_date = today - timedelta(days=i)
            query = self.db.query(func.sum(WaterConsumption.total_liters_consumed)).filter(
                WaterConsumption.consumption_date >= target_date,
                WaterConsumption.consumption_date <= target_date
            )
            if zone_id:
                query = query.filter(WaterConsumption.zone_id == zone_id)
            
            total = query.scalar() or 0
            weekly_data.append({
                "date": target_date.isoformat(),
                "day": target_date.strftime("%a"),
                "total_liters": total
            })
        
        return weekly_data