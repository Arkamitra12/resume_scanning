
from fastapi import FastAPI

from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router
from app.routes.candidates import router as candidates_router
from app.routes.screening import router as screening_router
from app.routes.applications import router as application
from app.routes.reviews import router as reviews_router

app = FastAPI(
    title="AI Recruitment and Resume Screening System",
    description="Backend API for AI-powered recruitment and resume screening",
    version="1.0.0"
)


# Register API routers
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(candidates_router)
app.include_router(screening_router)
app.include_router(application)
app.include_router(reviews_router)


@app.get("/")
def home():
    return {
        "message": "AI Recruitment Screening API is running successfully!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }

