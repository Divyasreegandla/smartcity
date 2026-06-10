from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from models.collection_routes import CollectionRoute, RouteStatus
from models.waste_vehicles import WasteVehicle
from schemas.collection_route_schemas import CollectionRouteCreate, CollectionRouteUpdate, CollectionRouteResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/collection-routes", tags=["Collection"])

@router.post("/", response_model=CollectionRouteResponse, status_code=status.HTTP_201_CREATED)
def create_route(
    data: CollectionRouteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    existing = db.query(CollectionRoute).filter(CollectionRoute.route_code == data.route_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Route code already exists")
    
    db_route = CollectionRoute(**data.model_dump())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == db_route.assigned_vehicle_id).first()
    return {
        **db_route.__dict__,
        "assigned_vehicle_number": vehicle.vehicle_number if vehicle else None
    }

@router.get("/", response_model=List[CollectionRouteResponse])
def get_routes(
    skip: int = 0,
    limit: int = 100,
    status: Optional[RouteStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CollectionRoute)
    if status:
        query = query.filter(CollectionRoute.status == status)
    
    routes = query.offset(skip).limit(limit).all()
    result = []
    for route in routes:
        vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == route.assigned_vehicle_id).first()
        result.append({
            **route.__dict__,
            "assigned_vehicle_number": vehicle.vehicle_number if vehicle else None
        })
    return result

@router.get("/{route_id}", response_model=CollectionRouteResponse)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    route = db.query(CollectionRoute).filter(CollectionRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == route.assigned_vehicle_id).first()
    return {
        **route.__dict__,
        "assigned_vehicle_number": vehicle.vehicle_number if vehicle else None
    }

@router.put("/{route_id}", response_model=CollectionRouteResponse)
def update_route(
    route_id: int,
    data: CollectionRouteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    route = db.query(CollectionRoute).filter(CollectionRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(route, field, value)
    
    db.commit()
    db.refresh(route)
    
    vehicle = db.query(WasteVehicle).filter(WasteVehicle.id == route.assigned_vehicle_id).first()
    return {
        **route.__dict__,
        "assigned_vehicle_number": vehicle.vehicle_number if vehicle else None
    }