# services/waste_service.py
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
from datetime import date
from repositories import (
    WasteVehicleRepository,
    WasteBinRepository,
    CollectionRouteRepository,
    WasteCollectionRepository,
    SanitationWorkerRepository
)
from schemas.waste_vehicle_schemas import WasteVehicleCreate, WasteVehicleUpdate
from schemas.waste_bin_schemas import WasteBinCreate, WasteBinUpdate
from schemas.collection_route_schemas import CollectionRouteCreate, CollectionRouteUpdate
from schemas.waste_collection_schemas import WasteCollectionCreate
from schemas.sanitation_worker_schemas import SanitationWorkerCreate, SanitationWorkerUpdate


class WasteManagementService:
    def __init__(self, db: Session):
        self.db = db
        self.vehicle_repo = WasteVehicleRepository(db)
        self.bin_repo = WasteBinRepository(db)
        self.route_repo = CollectionRouteRepository(db)
        self.collection_repo = WasteCollectionRepository(db)
        self.worker_repo = SanitationWorkerRepository(db)

    # Vehicle methods
    def create_vehicle(self, data: WasteVehicleCreate):
        existing = self.vehicle_repo.get_by_vehicle_number(data.vehicle_number)
        if existing:
            return None, "Vehicle number already exists"
        vehicle = self.vehicle_repo.create(**data.model_dump())
        return vehicle, None

    def get_all_vehicles(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.vehicle_repo.get_by_status(status, skip, limit)
        return self.vehicle_repo.get_all(skip=skip, limit=limit)

    def get_vehicle_by_id(self, vehicle_id: int):
        return self.vehicle_repo.get_by_id(vehicle_id)

    def update_vehicle(self, vehicle_id: int, data: WasteVehicleUpdate):
        return self.vehicle_repo.update_from_dict(vehicle_id, data.model_dump(exclude_unset=True))

    def delete_vehicle(self, vehicle_id: int) -> bool:
        return self.vehicle_repo.delete(vehicle_id)

    # Bin methods
    def create_bin(self, data: WasteBinCreate):
        existing = self.bin_repo.get_by_bin_code(data.bin_code)
        if existing:
            return None, "Bin code already exists"
        bin_obj = self.bin_repo.create(**data.model_dump())
        return bin_obj, None

    def get_all_bins(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.bin_repo.get_by_status(status, skip, limit)
        return self.bin_repo.get_all(skip=skip, limit=limit)

    def get_bin_by_id(self, bin_id: int):
        return self.bin_repo.get_by_id(bin_id)

    def update_bin(self, bin_id: int, data: WasteBinUpdate):
        update_data = data.model_dump(exclude_unset=True)
        if 'fill_level' in update_data:
            return self.bin_repo.update_fill_level(bin_id, update_data['fill_level'])
        return self.bin_repo.update_from_dict(bin_id, update_data)

    # Route methods
    def create_route(self, data: CollectionRouteCreate):
        existing = self.route_repo.get_by_route_code(data.route_code)
        if existing:
            return None, "Route code already exists"
        route = self.route_repo.create(**data.model_dump())
        return route, None

    def get_all_routes(self, skip: int = 0, limit: int = 100, status: str = None):
        if status:
            return self.route_repo.get_by_status(status, skip, limit)
        return self.route_repo.get_all(skip=skip, limit=limit)

    def get_route_by_id(self, route_id: int):
        return self.route_repo.get_by_id(route_id)

    def update_route(self, route_id: int, data: CollectionRouteUpdate):
        return self.route_repo.update_from_dict(route_id, data.model_dump(exclude_unset=True))

    # Collection methods
    def create_collection_log(self, data: WasteCollectionCreate):
        route = self.route_repo.get_by_id(data.route_id)
        if not route:
            return None, "Route not found"
        vehicle = self.vehicle_repo.get_by_id(data.vehicle_id)
        if not vehicle:
            return None, "Vehicle not found"
        
        log = self.collection_repo.create(**data.model_dump())
        return log, None

    def get_collection_logs(self, skip: int = 0, limit: int = 100, 
                           route_id: int = None, vehicle_id: int = None,
                           start_date: date = None, end_date: date = None):
        if route_id:
            return self.collection_repo.get_by_route_id(route_id, skip, limit)
        if vehicle_id:
            return self.collection_repo.get_by_vehicle_id(vehicle_id, skip, limit)
        if start_date and end_date:
            return self.collection_repo.get_by_date_range(start_date, end_date)
        return self.collection_repo.get_all(skip=skip, limit=limit)

    def get_daily_collection_report(self, report_date: date = None):
        if not report_date:
            report_date = date.today()
        return self.collection_repo.get_daily_total(report_date)

    # Worker methods
    def create_worker(self, data: SanitationWorkerCreate):
        existing = self.worker_repo.get_by_employee_code(data.employee_code)
        if existing:
            return None, "Employee code already exists"
        worker = self.worker_repo.create(**data.model_dump())
        return worker, None

    def get_all_workers(self, skip: int = 0, limit: int = 100, 
                       status: str = None, shift_type: str = None):
        if status:
            return self.worker_repo.get_by_status(status, skip, limit)
        if shift_type:
            return self.worker_repo.get_by_shift(shift_type, skip, limit)
        return self.worker_repo.get_all(skip=skip, limit=limit)

    def get_worker_by_id(self, worker_id: int):
        return self.worker_repo.get_by_id(worker_id)

    def update_worker(self, worker_id: int, data: SanitationWorkerUpdate):
        return self.worker_repo.update_from_dict(worker_id, data.model_dump(exclude_unset=True))

    # Dashboard methods
    def get_dashboard_stats(self):
        total_vehicles = self.vehicle_repo.count()
        active_vehicles = len(self.vehicle_repo.get_active_vehicles())
        total_routes = self.route_repo.count()
        active_routes = len(self.route_repo.get_active_routes())
        total_bins = self.bin_repo.count()
        full_bins = len(self.bin_repo.get_full_bins())
        total_workers = self.worker_repo.count()
        active_workers = len(self.worker_repo.get_active_workers())
        daily_collection = self.collection_repo.get_daily_total(date.today())
        
        return {
            "total_vehicles": total_vehicles,
            "active_vehicles": active_vehicles,
            "total_routes": total_routes,
            "active_routes": active_routes,
            "total_bins": total_bins,
            "full_bins": full_bins,
            "total_workers": total_workers,
            "active_workers": active_workers,
            "daily_collection_kg": daily_collection["total_weight_kg"]
        }

    def get_collection_trend(self, days: int = 7):
        trend = self.collection_repo.get_weekly_trend()
        return {"trend": trend[-days:], "total_weekly_weight": sum(t["weight_kg"] for t in trend[-days:])}

    def get_bin_status_summary(self):
        return self.bin_repo.get_bin_status_summary()

    def get_route_performance(self, days: int = 30):
        return self.collection_repo.get_route_performance(days)

    def get_vehicle_utilization(self):
        return self.collection_repo.get_vehicle_performance(30)