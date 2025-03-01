from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from .api.api import api_router
from .core.config import settings
from .db.elasticsearch import init_es, close_es

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# 创建FastAPI应用
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Time Glass application",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中，应该限制为前端应用的URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    """应用启动时执行的操作"""
    logger.info("Starting up Time Glass API")
    await init_es()

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时执行的操作"""
    logger.info("Shutting down Time Glass API")
    await close_es()

@app.get("/")
async def root():
    return {"message": "Welcome to Time Glass API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 