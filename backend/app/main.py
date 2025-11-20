from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection

# import routers
from app.api.v1 import uploads, jobs, segments, user_settings
from app.routes import video_censor  # import route video_censor

# lifespan สำหรับ startup/shutdown MongoDB
@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

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

# รวม routers
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
app.include_router(
    video_censor.router,
    prefix=f"{settings.API_V1_PREFIX}/video-censor",
    tags=["video-censor"]
)
app.include_router(
    segments.router,
    prefix=f"{settings.API_V1_PREFIX}/segments",
    tags=["segments"]
)
app.include_router(
    user_settings.router,
    prefix=f"{settings.API_V1_PREFIX}/user-settings",
    tags=["user-settings"]
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
