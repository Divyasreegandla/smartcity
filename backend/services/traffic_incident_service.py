from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.traffic_incident_repository import TrafficIncidentRepository
from schemas.traffic_incident_schemas import TrafficIncidentCreate, TrafficIncidentUpdate


class TrafficIncidentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TrafficIncidentRepository(db)

    def create_incident(self, data: TrafficIncidentCreate, reported_by: int):
        incident_number = self.repo.generate_incident_number()
        incident = self.repo.create(
            incident_number=incident_number,
            reported_by=reported_by,
            **data.model_dump()
        )
        return incident

    def get_all_incidents(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.repo.get_by_status(status, skip, limit)
        return self.repo.get_all(skip=skip, limit=limit)

    def get_incident_by_id(self, incident_id: int):
        return self.repo.get_by_id(incident_id)

    def update_incident(self, incident_id: int, data: TrafficIncidentUpdate):
        incident = self.repo.get_by_id(incident_id)
        if not incident:
            return None
        return self.repo.update_from_dict(incident_id, data.model_dump(exclude_unset=True))

    def resolve_incident(self, incident_id: int):
        incident = self.repo.get_by_id(incident_id)
        if not incident:
            return None
        return self.repo.resolve_incident(incident_id)

    def get_active_incidents(self):
        return self.repo.get_active_incidents()

    def get_dashboard_stats(self) -> Dict:
        return self.repo.get_statistics()