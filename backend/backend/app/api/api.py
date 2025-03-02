from fastapi import APIRouter
from .endpoints import data, query, app_usage

api_router = APIRouter()

# 添加数据路由
api_router.include_router(data.router, prefix="/data", tags=["data"])

# 添加查询路由
api_router.include_router(query.router, prefix="/query", tags=["query"])

# 添加应用使用分析路由
api_router.include_router(app_usage.router, prefix="/app-usage", tags=["app-usage"]) 