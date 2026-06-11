from typing import Optional, List
from sqlalchemy.orm import Session
from models.waste_vehicles import WasteVehicle, VehicleStatus, VehicleType
from .base_repository import BaseRepository


class WasteVehicleRepository(BaseRepository[WasteVehicle]):
    def __init__(self, db: Session):
        super().__init__(WasteVehicle, db)

    def get_by_vehicle_number(self, vehicle_number: str) -> Optional[WasteVehicle]:
        """Get vehicle by vehicle number"""
        return self.db.query(WasteVehicle).filter(
            WasteVehicle.vehicle_number == vehicle_number.upper()
        ).first()

    def get_by_status(self, status: VehicleStatus, skip: int = 0, limit: int = 100) -> List[WasteVehicle]:
        """Get vehicles by status"""
        return self.db.query(WasteVehicle).filter(
            WasteVehicle.status == status
        ).offset(skip).limit(limit).all()

    def get_by_type(self, vehicle_type: VehicleType, skip: int = 0, limit: int = 100) -> List[WasteVehicle]:
        """Get vehicles by type"""
        return self.db.query(WasteVehicle).filter(
            WasteVehicle.vehicle_type == vehicle_type
        ).offset(skip).limit(limit).all()

    def get_active_vehicles(self) -> List[WasteVehicle]:
        """Get all active vehicles"""
        return self.get_by_status(VehicleStatus.ACTIVE)

    def get_vehicles_for_maintenance(self) -> List[WasteVehicle]:
        """Get vehicles under maintenance"""
        return self.get_by_status(VehicleStatus.MAINTENANCE)

    def update_status(self, vehicle_id: int, status: VehicleStatus) -> Optional[WasteVehicle]:
        """Update vehicle status"""
        return self.update(vehicle_id, status=status)

    def get_vehicle_count_by_type(self) -> dict:
        """Get count of vehicles by type"""
        result = {}
        for vtype in VehicleType:
            count = self.db.query(WasteVehicle).filter(
                WasteVehicle.vehicle_type == vtype
            ).count()
            result[vtype.value] = count
        return result