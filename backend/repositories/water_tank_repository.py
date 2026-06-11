from typing import Optional, List
from sqlalchemy.orm import Session
from models.water_tanks import WaterTank, TankStatus
from .base_repository import BaseRepository


class WaterTankRepository(BaseRepository[WaterTank]):
    def __init__(self, db: Session):
        super().__init__(WaterTank, db)

    def get_by_name(self, tank_name: str) -> Optional[WaterTank]:
        """Get tank by name"""
        return self.db.query(WaterTank).filter(WaterTank.tank_name == tank_name).first()

    def get_by_status(self, status: TankStatus, skip: int = 0, limit: int = 100) -> List[WaterTank]:
        """Get tanks by status"""
        return self.db.query(WaterTank).filter(WaterTank.status == status).offset(skip).limit(limit).all()

    def get_critical_tanks(self) -> List[WaterTank]:
        """Get tanks with critical status"""
        return self.db.query(WaterTank).filter(WaterTank.status == TankStatus.CRITICAL).all()

    def update_level(self, tank_id: int, current_level: float) -> Optional[WaterTank]:
        """Update tank level and auto-update status"""
        tank = self.get_by_id(tank_id)
        if tank:
            tank.current_level = current_level
            fill_percentage = (tank.current_level / tank.capacity_liters) * 100
            if fill_percentage >= 90:
                tank.status = TankStatus.FULL
            elif fill_percentage >= 50:
                tank.status = TankStatus.PARTIAL
            elif fill_percentage >= 20:
                tank.status = TankStatus.LOW
            else:
                tank.status = TankStatus.CRITICAL
            self.db.commit()
            self.db.refresh(tank)
        return tank

    def get_total_capacity(self) -> float:
        """Get total capacity of all tanks"""
        result = self.db.query(WaterTank.capacity_liters).all()
        return sum(r[0] for r in result)

    def get_total_current_level(self) -> float:
        """Get total current level of all tanks"""
        result = self.db.query(WaterTank.current_level).all()
        return sum(r[0] for r in result)