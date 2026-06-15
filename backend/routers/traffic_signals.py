from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.traffic_signal_service import TrafficSignalService
from schemas.traffic_signal_schemas import TrafficSignalCreate, TrafficSignalUpdate, TrafficSignalResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/traffic-signals", tags=["Traffic Signals"])


@router.post("/", response_model=TrafficSignalResponse, status_code=status.HTTP_201_CREATED)
def create_traffic_signal(
    data: TrafficSignalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = TrafficSignalService(db)
    signal, error = service.create_signal(data)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return signal


@router.get("/", response_model=List[TrafficSignalResponse])
def get_traffic_signals(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficSignalService(db)
    return service.get_all_signals(skip, limit, status)


@router.get("/{signal_id}", response_model=TrafficSignalResponse)
def get_traffic_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficSignalService(db)
    signal = service.get_signal_by_id(signal_id)
    if not signal:
        raise HTTPException(status_code=404, detail="Traffic signal not found")
    return signal


@router.put("/{signal_id}", response_model=TrafficSignalResponse)
def update_traffic_signal(
    signal_id: int,
    data: TrafficSignalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = TrafficSignalService(db)
    signal = service.update_signal(signal_id, data)
    if not signal:
        raise HTTPException(status_code=404, detail="Traffic signal not found")
    return signal


@router.delete("/{signal_id}")
def delete_traffic_signal(
    signal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = TrafficSignalService(db)
    deleted = service.delete_signal(signal_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Traffic signal not found")
    return {"message": "Traffic signal deleted successfully"}