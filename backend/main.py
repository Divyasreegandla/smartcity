from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database.database import engine, Base
from routers import auth_router, citizens_router, complaints_router, departments_router, assignments_router

# Create tables
Base.metadata.create_all(bind=engine)

# Create uploads directory
Path("uploads/complaints").mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Smart City Platform", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth_router)
app.include_router(citizens_router)
app.include_router(complaints_router)
app.include_router(departments_router)
app.include_router(assignments_router)

@app.get("/")
def root():
    return {"message": "Smart City Platform API", "version": "2.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}