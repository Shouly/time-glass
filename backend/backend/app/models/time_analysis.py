from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Enum, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.mysql import Base
import enum

class ProductivityType(str, enum.Enum):
    PRODUCTIVE = "productive"
    NON_PRODUCTIVE = "non_productive"
    NEUTRAL = "neutral"

class AppCategory(Base):
    """应用分类表"""
    __tablename__ = "app_categories"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    productivity_type = Column(Enum(ProductivityType), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关系
    hourly_usages = relationship("HourlyAppUsage", back_populates="category")

class HourlyAppUsage(Base):
    """小时应用使用统计表"""
    __tablename__ = "hourly_app_usage"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(50), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    hour_of_day = Column(Integer, nullable=False)
    day_of_week = Column(Integer, nullable=False)
    is_working_hour = Column(Boolean, nullable=False)
    app_name = Column(String(100), nullable=False, index=True)
    window_name = Column(String(255), nullable=True)
    app_category_id = Column(Integer, ForeignKey("app_categories.id"), nullable=True)
    total_time_seconds = Column(Float, nullable=False)
    active_time_seconds = Column(Float, nullable=True)
    session_count = Column(Integer, nullable=False)
    avg_session_time = Column(Float, nullable=True)
    switch_count = Column(Integer, nullable=True)
    concurrent_apps = Column(Float, nullable=True)
    device_os = Column(String(50), nullable=True)
    device_os_version = Column(String(50), nullable=True)
    network_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # 关系
    category = relationship("AppCategory", back_populates="hourly_usages")
    
    # 唯一约束
    __table_args__ = (
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    ) 