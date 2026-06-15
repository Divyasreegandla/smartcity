from typing import Optional, List
from sqlalchemy.orm import Session
from models.traffic_signals import TrafficSignal, SignalStatus
from .base_repository import BaseRepository


class TrafficSignalRepository(BaseRepository[TrafficSignal]):
    def __init__(self, db: Session):
        super().__init__(TrafficSignal, db)

    def get_by_code(self, signal_code: str) -> Optional[TrafficSignal]:
        return self.db.query(TrafficSignal).filter(
            TrafficSignal.signal_code == signal_code.upper()
        ).first()

    def get_by_status(self, status: SignalStatus, skip: int = 0, limit: int = 100) -> List[TrafficSignal]:
        return self.db.query(TrafficSignal).filter(
            TrafficSignal.signal_status == status
        ).offset(skip).limit(limit).all()

    def update_status(self, signal_id: int, status: SignalStatus) -> Optional[TrafficSignal]:
        return self.update(signal_id, signal_status=status)

    def get_statistics(self) -> dict:
        total = self.count()
        red = self.db.query(TrafficSignal).filter(TrafficSignal.signal_status == SignalStatus.RED).count()
        yellow = self.db.query(TrafficSignal).filter(TrafficSignal.signal_status == SignalStatus.YELLOW).count()
        green = self.db.query(TrafficSignal).filter(TrafficSignal.signal_status == SignalStatus.GREEN).count()
        return {"total": total, "red": red, "yellow": yellow, "green": green}

    def generate_signal_code(self) -> str:
        count = self.count()
        return f"SIG-{str(count + 1).zfill(4)}"