from fastapi import APIRouter
from .endpoints import data

api_router = APIRouter()

# 添加数据路由
api_router.include_router(data.router, prefix="/data", tags=["data"]) 