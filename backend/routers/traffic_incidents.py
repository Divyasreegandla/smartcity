from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database.database import get_db
from services.traffic_incident_service import TrafficIncidentService
from schemas.traffic_incident_schemas import TrafficIncidentCreate, TrafficIncidentUpdate, TrafficIncidentResponse
from utils.auth_utils import get_current_user, get_current_admin_user
from models.users import User

router = APIRouter(prefix="/traffic-incidents", tags=["Traffic Incidents"])


@router.post("/", response_model=TrafficIncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    data: TrafficIncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficIncidentService(db)
    incident = service.create_incident(data, current_user.id)
    return incident


@router.get("/", response_model=List[TrafficIncidentResponse])
def get_incidents(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficIncidentService(db)
    return service.get_all_incidents(skip, limit, status)


@router.get("/active")
def get_active_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficIncidentService(db)
    return service.get_active_incidents()


@router.get("/{incident_id}", response_model=TrafficIncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = TrafficIncidentService(db)
    incident = service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.put("/{incident_id}", response_model=TrafficIncidentResponse)
def update_incident(
    incident_id: int,
    data: TrafficIncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    service = TrafficIncidentService(db)
    incident = service.update_incident(incident_id, data)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident