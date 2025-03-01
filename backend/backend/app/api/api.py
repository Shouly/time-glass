from fastapi import APIRouter
from .endpoints import data, query

api_router = APIRouter()

# 添加数据路由
api_router.include_router(data.router, prefix="/data", tags=["data"])

# 添加查询路由
api_router.include_router(query.router, prefix="/query", tags=["query"]) 