from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import datetime, timedelta
from models.power_outages import PowerOutage, OutageStatus
from schemas.power_outage_schemas import PowerOutageCreate, PowerOutageUpdate

class PowerOutageService:
    def __init__(self, db: Session):
        self.db = db

    def generate_outage_number(self) -> str:
        """Generate unique outage number"""
        today = datetime.now().strftime("%Y%m%d")
        count = self.db.query(PowerOutage).filter(
            PowerOutage.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
        ).count()
        return f"OUT-{today}-{str(count + 1).zfill(4)}"

    def create_outage(self, data: PowerOutageCreate) -> PowerOutage:
        """Report a new power outage"""
        outage_number = self.generate_outage_number()
        
        db_outage = PowerOutage(
            outage_number=outage_number,
            area_name=data.area_name,
            outage_reason=data.outage_reason,
            outage_start_time=data.outage_start_time,
            status=data.status
        )
        self.db.add(db_outage)
        self.db.commit()
        self.db.refresh(db_outage)
        return db_outage

    def get_all_outages(self, skip: int = 0, limit: int = 100, status: Optional[OutageStatus] = None, area_name: Optional[str] = None) -> List[PowerOutage]:
        """Get all outages with filters"""
        query = self.db.query(PowerOutage)
        if status:
            query = query.filter(PowerOutage.status == status)
        if area_name:
            query = query.filter(PowerOutage.area_name.ilike(f"%{area_name}%"))
        return query.order_by(PowerOutage.outage_start_time.desc()).offset(skip).limit(limit).all()

    def get_outage_by_id(self, outage_id: int) -> Optional[PowerOutage]:
        """Get outage by ID"""
        return self.db.query(PowerOutage).filter(PowerOutage.id == outage_id).first()

    def update_outage(self, outage_id: int, data: PowerOutageUpdate) -> Optional[PowerOutage]:
        """Update outage"""
        outage = self.get_outage_by_id(outage_id)
        if not outage:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(outage, field, value)
        
        # Auto-set end time when resolved
        if data.status == OutageStatus.RESOLVED and not outage.outage_end_time:
            outage.outage_end_time = datetime.now()
        
        self.db.commit()
        self.db.refresh(outage)
        return outage

    def resolve_outage(self, outage_id: int, remarks: str = None) -> Optional[PowerOutage]:
        """Resolve an outage"""
        outage = self.get_outage_by_id(outage_id)
        if not outage:
            return None
        
        outage.status = OutageStatus.RESOLVED
        outage.outage_end_time = datetime.now()
        
        self.db.commit()
        self.db.refresh(outage)
        return outage

    def get_outage_statistics(self, days: int = 30) -> Dict:
        """Get outage statistics for dashboard"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        outages = self.db.query(PowerOutage).filter(
            PowerOutage.outage_start_time >= start_date,
            PowerOutage.outage_start_time <= end_date
        ).all()
        
        total_outages = len(outages)
        resolved_outages = len([o for o in outages if o.status == OutageStatus.RESOLVED])
        avg_duration = 0
        
        resolved_with_duration = [o for o in outages if o.status == OutageStatus.RESOLVED and o.outage_end_time]
        if resolved_with_duration:
            total_duration = sum((o.outage_end_time - o.outage_start_time).total_seconds() / 3600 for o in resolved_with_duration)
            avg_duration = total_duration / len(resolved_with_duration)
        
        # Group by area
        area_stats = {}
        for outage in outages:
            if outage.area_name not in area_stats:
                area_stats[outage.area_name] = 0
            area_stats[outage.area_name] += 1
        
        return {
            "total_outages": total_outages,
            "resolved_outages": resolved_outages,
            "pending_outages": total_outages - resolved_outages,
            "resolution_rate": (resolved_outages / total_outages * 100) if total_outages > 0 else 0,
            "average_duration_hours": round(avg_duration, 2),
            "most_affected_areas": sorted(area_stats.items(), key=lambda x: x[1], reverse=True)[:5]
        }

    def get_active_outages(self) -> List[PowerOutage]:
        """Get currently active outages"""
        return self.db.query(PowerOutage).filter(
            PowerOutage.status.in_([OutageStatus.REPORTED, OutageStatus.IN_PROGRESS])
        ).all()