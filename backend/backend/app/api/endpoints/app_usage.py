from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date, datetime, timedelta

from ...db.mysql import get_db
from ...services.app_usage_service import AppUsageService
from ...models.api_models import (
    AppCategoryCreate, 
    AppCategoryResponse, 
    HourlyAppUsageCreate,
    HourlyAppUsageResponse,
    PaginatedResponse,
    ProductivitySummary,
    ProductivityTypeEnum,
    BatchAppUsageCreate
)

router = APIRouter()

# 应用类别相关端点
@router.post("/categories", response_model=AppCategoryResponse)
async def create_app_category(
    category: AppCategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """创建新的应用类别"""
    service = AppUsageService(db)
    try:
        new_category = await service.create_app_category(
            name=category.name,
            productivity_type=category.productivity_type
        )
        return AppCategoryResponse(
            id=new_category.id,
            name=new_category.name,
            productivity_type=new_category.productivity_type,
            created_at=new_category.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"创建应用类别失败: {str(e)}")

@router.get("/categories", response_model=PaginatedResponse[AppCategoryResponse])
async def get_app_categories(
    skip: int = 0,
    limit: int = 100,
    productivity_type: Optional[ProductivityTypeEnum] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取应用类别列表"""
    service = AppUsageService(db)
    try:
        categories, total = await service.get_app_categories(
            skip=skip,
            limit=limit,
            productivity_type=productivity_type
        )
        
        results = [
            AppCategoryResponse(
                id=cat.id,
                name=cat.name,
                productivity_type=cat.productivity_type,
                created_at=cat.created_at
            ) for cat in categories
        ]
        
        return PaginatedResponse[AppCategoryResponse](
            items=results,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"获取应用类别失败: {str(e)}")

@router.get("/categories/{category_id}", response_model=AppCategoryResponse)
async def get_app_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """获取特定应用类别"""
    service = AppUsageService(db)
    try:
        category = await service.get_app_category_by_id(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="应用类别不存在")
        
        return AppCategoryResponse(
            id=category.id,
            name=category.name,
            productivity_type=category.productivity_type,
            created_at=category.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"获取应用类别失败: {str(e)}")

@router.put("/categories/{category_id}", response_model=AppCategoryResponse)
async def update_app_category(
    category_id: int,
    category: AppCategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """更新应用类别"""
    service = AppUsageService(db)
    try:
        updated_category = await service.update_app_category(
            category_id=category_id,
            name=category.name,
            productivity_type=category.productivity_type
        )
        if not updated_category:
            raise HTTPException(status_code=404, detail="应用类别不存在")
        
        return AppCategoryResponse(
            id=updated_category.id,
            name=updated_category.name,
            productivity_type=updated_category.productivity_type,
            created_at=updated_category.created_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"更新应用类别失败: {str(e)}")

@router.delete("/categories/{category_id}", response_model=dict)
async def delete_app_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    """删除应用类别"""
    service = AppUsageService(db)
    try:
        success = await service.delete_app_category(category_id)
        if not success:
            raise HTTPException(status_code=404, detail="应用类别不存在")
        
        return {"status": "success", "message": "应用类别已删除"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"删除应用类别失败: {str(e)}")

# 应用使用时间相关端点
@router.post("/usage", response_model=HourlyAppUsageResponse)
async def record_app_usage(
    usage: HourlyAppUsageCreate,
    db: AsyncSession = Depends(get_db)
):
    """记录应用使用时间"""
    service = AppUsageService(db)
    try:
        new_usage = await service.record_hourly_app_usage(
            app_name=usage.app_name,
            category_id=usage.category_id,
            usage_date=usage.usage_date,
            hour=usage.hour,
            duration_minutes=usage.duration_minutes
        )
        
        return HourlyAppUsageResponse(
            id=new_usage.id,
            app_name=new_usage.app_name,
            category_id=new_usage.category_id,
            usage_date=new_usage.usage_date,
            hour=new_usage.hour,
            duration_minutes=new_usage.duration_minutes,
            created_at=new_usage.created_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"记录应用使用时间失败: {str(e)}")

@router.get("/usage", response_model=PaginatedResponse[HourlyAppUsageResponse])
async def get_app_usage(
    start_date: date = Query(..., description="开始日期"),
    end_date: date = Query(..., description="结束日期"),
    app_name: Optional[str] = None,
    category_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """获取应用使用时间记录"""
    service = AppUsageService(db)
    try:
        usage_records, total = await service.get_hourly_app_usage(
            start_date=start_date,
            end_date=end_date,
            app_name=app_name,
            category_id=category_id,
            skip=skip,
            limit=limit
        )
        
        results = [
            HourlyAppUsageResponse(
                id=record.id,
                app_name=record.app_name,
                category_id=record.category_id,
                usage_date=record.usage_date,
                hour=record.hour,
                duration_minutes=record.duration_minutes,
                created_at=record.created_at
            ) for record in usage_records
        ]
        
        return PaginatedResponse[HourlyAppUsageResponse](
            items=results,
            total=total,
            page=skip // limit + 1,
            size=limit
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"获取应用使用时间记录失败: {str(e)}")

@router.get("/productivity-summary", response_model=ProductivitySummary)
async def get_productivity_summary(
    start_date: date = Query(..., description="开始日期"),
    end_date: date = Query(..., description="结束日期"),
    db: AsyncSession = Depends(get_db)
):
    """获取生产力统计摘要"""
    service = AppUsageService(db)
    try:
        productive_minutes, neutral_minutes, distracting_minutes = await service.get_productivity_summary(
            start_date=start_date,
            end_date=end_date
        )
        
        total_minutes = productive_minutes + neutral_minutes + distracting_minutes
        
        return ProductivitySummary(
            start_date=start_date,
            end_date=end_date,
            productive_minutes=productive_minutes,
            neutral_minutes=neutral_minutes,
            distracting_minutes=distracting_minutes,
            total_minutes=total_minutes,
            productive_percentage=round(productive_minutes / total_minutes * 100, 2) if total_minutes > 0 else 0,
            neutral_percentage=round(neutral_minutes / total_minutes * 100, 2) if total_minutes > 0 else 0,
            distracting_percentage=round(distracting_minutes / total_minutes * 100, 2) if total_minutes > 0 else 0
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"获取生产力统计摘要失败: {str(e)}")

@router.get("/daily-usage", response_model=List[dict])
async def get_daily_app_usage(
    start_date: date = Query(..., description="开始日期"),
    end_date: date = Query(..., description="结束日期"),
    db: AsyncSession = Depends(get_db)
):
    """获取每日应用使用时间统计"""
    service = AppUsageService(db)
    try:
        daily_usage = await service.get_daily_app_usage(
            start_date=start_date,
            end_date=end_date
        )
        
        return daily_usage
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"获取每日应用使用时间统计失败: {str(e)}")

# 批量记录应用使用时间
@router.post("/usage/batch", response_model=dict)
async def batch_record_app_usage(
    usage_batch: BatchAppUsageCreate,
    db: AsyncSession = Depends(get_db)
):
    """批量记录应用使用时间"""
    service = AppUsageService(db)
    try:
        results = await service.batch_record_hourly_app_usage(usage_batch.items)
        
        return {
            "status": "success",
            "message": f"成功记录 {len(results)} 条应用使用时间数据",
            "processed_count": len(results),
            "total_count": len(usage_batch.items)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"批量记录应用使用时间失败: {str(e)}")