from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from models.water_tanks import WaterTank, TankStatus
from schemas.water_tank_schemas import WaterTankCreate, WaterTankUpdate

class WaterTankService:
    def __init__(self, db: Session):
        self.db = db

    def create_tank(self, tank_data: WaterTankCreate) -> WaterTank:
        db_tank = WaterTank(**tank_data.model_dump())
        self.db.add(db_tank)
        self.db.commit()
        self.db.refresh(db_tank)
        return db_tank

    def get_all_tanks(self, skip: int = 0, limit: int = 100, status: Optional[TankStatus] = None) -> List[WaterTank]:
        query = self.db.query(WaterTank)
        if status:
            query = query.filter(WaterTank.status == status)
        return query.offset(skip).limit(limit).all()

    def get_tank_by_id(self, tank_id: int) -> Optional[WaterTank]:
        return self.db.query(WaterTank).filter(WaterTank.id == tank_id).first()

    def update_tank(self, tank_id: int, tank_data: WaterTankUpdate) -> Optional[WaterTank]:
        tank = self.get_tank_by_id(tank_id)
        if not tank:
            return None
        
        update_data = tank_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(tank, field, value)
        
        # Auto-update status based on fill percentage
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

    def delete_tank(self, tank_id: int) -> bool:
        tank = self.get_tank_by_id(tank_id)
        if not tank:
            return False
        self.db.delete(tank)
        self.db.commit()
        return True