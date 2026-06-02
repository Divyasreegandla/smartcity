from .auth import router as auth_router
from .citizens import router as citizens_router
from .complaints import router as complaints_router
from .departments import router as departments_router
from .assignments import router as assignments_router

__all__ = [
    "auth_router",
    "citizens_router",
    "complaints_router",
    "departments_router",
    "assignments_router"
]