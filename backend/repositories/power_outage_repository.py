from typing import Optional, List
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.power_outages import PowerOutage, OutageStatus
from .base_repository import BaseRepository


class PowerOutageRepository(BaseRepository[PowerOutage]):
    def __init__(self, db: Session):
        super().__init__(PowerOutage, db)

    def get_by_outage_number(self, outage_number: str) -> Optional[PowerOutage]:
        """Get outage by outage number"""
        return self.db.query(PowerOutage).filter(PowerOutage.outage_number == outage_number).first()

    def get_by_area(self, area_name: str, skip: int = 0, limit: int = 100) -> List[PowerOutage]:
        """Get outages by area"""
        return self.db.query(PowerOutage).filter(
            PowerOutage.area_name.ilike(f"%{area_name}%")
        ).order_by(PowerOutage.outage_start_time.desc()).offset(skip).limit(limit).all()

    def get_by_status(self, status: OutageStatus, skip: int = 0, limit: int = 100) -> List[PowerOutage]:
        """Get outages by status"""
        return self.db.query(PowerOutage).filter(
            PowerOutage.status == status
        ).order_by(PowerOutage.outage_start_time.desc()).offset(skip).limit(limit).all()

    def get_active_outages(self) -> List[PowerOutage]:
        """Get currently active outages"""
        return self.db.query(PowerOutage).filter(
            PowerOutage.status.in_([OutageStatus.REPORTED, OutageStatus.IN_PROGRESS])
        ).all()

    def resolve_outage(self, outage_id: int, remarks: str = None) -> Optional[PowerOutage]:
        """Mark outage as resolved"""
        outage = self.get_by_id(outage_id)
        if outage:
            outage.status = OutageStatus.RESOLVED
            outage.outage_end_time = datetime.now()
            self.db.commit()
            self.db.refresh(outage)
        return outage

    def get_today_count(self) -> int:
        """Get number of outages reported today"""
        today = datetime.now().replace(hour=0, minute=0, second=0)
        return self.db.query(PowerOutage).filter(PowerOutage.created_at >= today).count()

    def generate_outage_number(self) -> str:
        """Generate unique outage number"""
        today = datetime.now().strftime("%Y%m%d")
        count = self.get_today_count()
        return f"OUT-{today}-{str(count + 1).zfill(4)}"

    def get_statistics(self, days: int = 30) -> dict:
        """Get outage statistics"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        outages = self.db.query(PowerOutage).filter(
            PowerOutage.outage_start_time >= start_date,
            PowerOutage.outage_start_time <= end_date
        ).all()
        
        total = len(outages)
        resolved = len([o for o in outages if o.status == OutageStatus.RESOLVED])
        
        # Calculate average resolution time
        resolved_with_duration = [o for o in outages if o.status == OutageStatus.RESOLVED and o.outage_end_time]
        avg_duration = 0
        if resolved_with_duration:
            total_duration = sum((o.outage_end_time - o.outage_start_time).total_seconds() / 3600 for o in resolved_with_duration)
            avg_duration = total_duration / len(resolved_with_duration)
        
        return {
            "total_outages": total,
            "resolved_outages": resolved,
            "pending_outages": total - resolved,
            "average_duration_hours": round(avg_duration, 2),
            "resolution_rate": (resolved / total * 100) if total > 0 else 0
        }