from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.waste_service import WasteManagementService
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
    service = WasteManagementService(db)
    route, error = service.create_route(data)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    return route


@router.get("/", response_model=List[CollectionRouteResponse])
def get_routes(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    return service.get_all_routes(skip, limit, status)


@router.get("/{route_id}", response_model=CollectionRouteResponse)
def get_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = WasteManagementService(db)
    route = service.get_route_by_id(route_id)
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return route


@router.put("/{route_id}", response_model=CollectionRouteResponse)
def update_route(
    route_id: int,
    data: CollectionRouteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = WasteManagementService(db)
    route = service.update_route(route_id, data)
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    return route