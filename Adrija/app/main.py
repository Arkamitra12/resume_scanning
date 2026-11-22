
from fastapi import FastAPI

from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router


app = FastAPI(
    title="AI Recruitment and Resume Screening System",
    description="Backend API for AI-powered recruitment and resume screening",
    version="1.0.0"
)


# Register API routers
app.include_router(auth_router)
app.include_router(jobs_router)


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

