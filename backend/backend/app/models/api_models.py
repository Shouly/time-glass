from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


# 生产力类型枚举
class ProductivityTypeEnum(str, Enum):
    PRODUCTIVE = "PRODUCTIVE"
    NEUTRAL = "NEUTRAL"
    DISTRACTING = "DISTRACTING"


# 应用类别模型
class AppCategoryCreate(BaseModel):
    name: str
    productivity_type: ProductivityTypeEnum


class AppCategoryResponse(BaseModel):
    id: int
    name: str
    productivity_type: ProductivityTypeEnum
    created_at: datetime


# 通用分页响应模型
T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int


# 生产力统计摘要模型
class ProductivitySummary(BaseModel):
    start_date: date
    end_date: date
    productive_minutes: float
    neutral_minutes: float
    distracting_minutes: float
    total_minutes: float
    productive_percentage: float
    neutral_percentage: float
    distracting_percentage: float


# 应用使用统计响应模型
class AppUsageStats(BaseModel):
    app_name: str
    total_time_seconds: float
    percentage: float
    category: Optional[str] = None
    productivity_type: Optional[str] = None


class HourlyUsageStats(BaseModel):
    hour: int
    total_time_seconds: float
    productive_time_seconds: float
    distracting_time_seconds: float
    neutral_time_seconds: float


class DailyUsageStats(BaseModel):
    date: str
    total_time_seconds: float
    productive_time_seconds: float
    distracting_time_seconds: float
    neutral_time_seconds: float


# 按应用分组的每小时使用统计响应模型
class HourlyAppUsageSummary(BaseModel):
    hour: str
    app_name: str
    duration_minutes: float
    productivity_type: ProductivityTypeEnum
