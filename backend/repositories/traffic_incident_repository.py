from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from models.traffic_incidents import TrafficIncident, IncidentStatus
from .base_repository import BaseRepository


class TrafficIncidentRepository(BaseRepository[TrafficIncident]):
    def __init__(self, db: Session):
        super().__init__(TrafficIncident, db)

    def get_by_incident_number(self, incident_number: str) -> Optional[TrafficIncident]:
        return self.db.query(TrafficIncident).filter(
            TrafficIncident.incident_number == incident_number
        ).first()

    def get_by_status(self, status: IncidentStatus, skip: int = 0, limit: int = 100) -> List[TrafficIncident]:
        return self.db.query(TrafficIncident).filter(
            TrafficIncident.status == status
        ).order_by(TrafficIncident.incident_time.desc()).offset(skip).limit(limit).all()

    def get_active_incidents(self) -> List[TrafficIncident]:
        return self.db.query(TrafficIncident).filter(
            TrafficIncident.status.in_([IncidentStatus.REPORTED, IncidentStatus.IN_PROGRESS])
        ).all()

    def resolve_incident(self, incident_id: int) -> Optional[TrafficIncident]:
        return self.update(incident_id, status=IncidentStatus.RESOLVED)

    def generate_incident_number(self) -> str:
        today = datetime.now().strftime("%Y%m%d")
        count = self.db.query(TrafficIncident).filter(
            TrafficIncident.created_at >= datetime.now().replace(hour=0, minute=0, second=0)
        ).count()
        return f"INC-{today}-{str(count + 1).zfill(4)}"

    def get_statistics(self) -> dict:
        total = self.count()
        active = self.db.query(TrafficIncident).filter(
            TrafficIncident.status.in_([IncidentStatus.REPORTED, IncidentStatus.IN_PROGRESS])
        ).count()
        resolved = self.db.query(TrafficIncident).filter(TrafficIncident.status == IncidentStatus.RESOLVED).count()
        return {"total": total, "active": active, "resolved": resolved}