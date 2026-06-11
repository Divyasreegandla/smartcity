from typing import Optional, List
from sqlalchemy.orm import Session
from models.collection_routes import CollectionRoute, RouteStatus
from .base_repository import BaseRepository


class CollectionRouteRepository(BaseRepository[CollectionRoute]):
    def __init__(self, db: Session):
        super().__init__(CollectionRoute, db)

    def get_by_route_code(self, route_code: str) -> Optional[CollectionRoute]:
        """Get route by route code"""
        return self.db.query(CollectionRoute).filter(
            CollectionRoute.route_code == route_code.upper()
        ).first()

    def get_by_status(self, status: RouteStatus, skip: int = 0, limit: int = 100) -> List[CollectionRoute]:
        """Get routes by status"""
        return self.db.query(CollectionRoute).filter(
            CollectionRoute.status == status
        ).offset(skip).limit(limit).all()

    def get_active_routes(self) -> List[CollectionRoute]:
        """Get all active routes"""
        return self.get_by_status(RouteStatus.ACTIVE)

    def get_by_area(self, area_name: str, skip: int = 0, limit: int = 100) -> List[CollectionRoute]:
        """Get routes by area"""
        return self.db.query(CollectionRoute).filter(
            CollectionRoute.area_name.ilike(f"%{area_name}%")
        ).offset(skip).limit(limit).all()

    def get_by_vehicle(self, vehicle_id: int) -> List[CollectionRoute]:
        """Get routes assigned to a vehicle"""
        return self.db.query(CollectionRoute).filter(
            CollectionRoute.assigned_vehicle_id == vehicle_id
        ).all()

    def update_status(self, route_id: int, status: RouteStatus) -> Optional[CollectionRoute]:
        """Update route status"""
        return self.update(route_id, status=status)

    def assign_vehicle(self, route_id: int, vehicle_id: int) -> Optional[CollectionRoute]:
        """Assign a vehicle to a route"""
        return self.update(route_id, assigned_vehicle_id=vehicle_id)

    def get_routes_without_vehicle(self) -> List[CollectionRoute]:
        """Get routes with no vehicle assigned"""
        return self.db.query(CollectionRoute).filter(
            CollectionRoute.assigned_vehicle_id.is_(None)
        ).all()