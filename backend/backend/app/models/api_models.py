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
    
    # 与前一天比较
    yesterday_total_minutes: Optional[float] = None
    yesterday_productive_minutes: Optional[float] = None
    yesterday_neutral_minutes: Optional[float] = None
    yesterday_distracting_minutes: Optional[float] = None
    yesterday_productive_percentage: Optional[float] = None
    
    # 趋势信息
    total_minutes_change_percentage: Optional[float] = None  # 总时间变化百分比
    productive_percentage_change: Optional[float] = None  # 效率指数变化（百分点）
    
    # 应用统计
    most_used_app: Optional[str] = None  # 最常用应用
    most_used_app_percentage: Optional[float] = None  # 最常用应用占比
    
    # 异常信息
    anomaly_count: Optional[int] = None  # 异常行为数量
    anomaly_description: Optional[str] = None  # 异常描述


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
