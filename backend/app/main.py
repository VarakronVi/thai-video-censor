from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1 import uploads, jobs
from app.routes import video_censor  # import route video_censor

# lifespan สำหรับ startup/shutdown MongoDB
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()   # เชื่อม MongoDB ตอน startup
    yield
    await close_mongo_connection()  # ปิด connection ตอน shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    uploads.router,
    prefix=f"{settings.API_V1_PREFIX}/uploads",
    tags=["uploads"]
)

app.include_router(
    jobs.router,
    prefix=f"{settings.API_V1_PREFIX}/jobs",
    tags=["jobs"]
)

# Include video-censor router
app.include_router(
    video_censor.router,
    prefix=f"{settings.API_V1_PREFIX}/video-censor",
    tags=["video-censor"]
)

@app.get("/")
async def root():
    return {
        "message": "Thai Video Censor API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
