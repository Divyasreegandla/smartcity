from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from repositories.traffic_signal_repository import TrafficSignalRepository
from schemas.traffic_signal_schemas import TrafficSignalCreate, TrafficSignalUpdate


class TrafficSignalService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = TrafficSignalRepository(db)

    def create_signal(self, data: TrafficSignalCreate):
        existing = self.repo.get_by_code(data.signal_code)
        if existing:
            return None, "Signal code already exists"
        signal = self.repo.create(**data.model_dump())
        return signal, None

    def get_all_signals(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.repo.get_by_status(status, skip, limit)
        return self.repo.get_all(skip=skip, limit=limit)

    def get_signal_by_id(self, signal_id: int):
        return self.repo.get_by_id(signal_id)

    def update_signal(self, signal_id: int, data: TrafficSignalUpdate):
        signal = self.repo.get_by_id(signal_id)
        if not signal:
            return None
        return self.repo.update_from_dict(signal_id, data.model_dump(exclude_unset=True))

    def delete_signal(self, signal_id: int) -> bool:
        return self.repo.delete(signal_id)

    def update_signal_status(self, signal_id: int, status: str):
        signal = self.repo.get_by_id(signal_id)
        if not signal:
            return None
        return self.repo.update_status(signal_id, status)

    def get_dashboard_stats(self) -> Dict:
        return self.repo.get_statistics()