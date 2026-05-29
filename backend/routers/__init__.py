from .auth import router as auth_router
from .citizens import router as citizens_router

__all__ = ["auth_router", "citizens_router"]