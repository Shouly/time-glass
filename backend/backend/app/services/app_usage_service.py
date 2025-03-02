import logging
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from elasticsearch import AsyncElasticsearch
from sqlalchemy import and_, asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.app_usage import AppCategory, HourlyAppUsage, ProductivityType

logger = logging.getLogger(__name__)


class AppUsageService:
    def __init__(
        self, db: AsyncSession, es_client: Optional[AsyncElasticsearch] = None
    ):
        self.db = db
        self.es_client = es_client

    # 应用分类相关方法
    async def create_app_category(
        self, name: str, productivity_type: ProductivityType
    ) -> AppCategory:
        """创建新的应用类别"""
        # 检查是否已存在同名类别
        stmt = select(AppCategory).where(AppCategory.name == name)
        result = await self.db.execute(stmt)
        existing = result.scalars().first()

        if existing:
            raise ValueError(f"应用类别 '{name}' 已存在")

        # 创建新类别
        new_category = AppCategory(name=name, productivity_type=productivity_type)

        self.db.add(new_category)
        await self.db.commit()
        await self.db.refresh(new_category)

        return new_category

    async def get_app_categories(
        self,
        skip: int = 0,
        limit: int = 100,
        productivity_type: Optional[ProductivityType] = None,
    ) -> Tuple[List[AppCategory], int]:
        """获取应用类别列表"""
        # 构建查询
        query = select(AppCategory)
        count_query = select(func.count()).select_from(AppCategory)

        # 添加筛选条件
        if productivity_type:
            query = query.where(AppCategory.productivity_type == productivity_type)
            count_query = count_query.where(
                AppCategory.productivity_type == productivity_type
            )

        # 添加排序和分页
        query = query.order_by(AppCategory.name).offset(skip).limit(limit)

        # 执行查询
        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)

        categories = result.scalars().all()
        total = count_result.scalar()

        return categories, total

    async def get_app_category_by_id(self, category_id: int) -> Optional[AppCategory]:
        """根据ID获取应用类别"""
        stmt = select(AppCategory).where(AppCategory.id == category_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def update_app_category(
        self, category_id: int, name: str, productivity_type: ProductivityType
    ) -> Optional[AppCategory]:
        """更新应用类别"""
        # 获取要更新的类别
        category = await self.get_app_category_by_id(category_id)
        if not category:
            return None

        # 检查是否存在同名类别（排除自身）
        if name != category.name:
            stmt = select(AppCategory).where(
                and_(AppCategory.name == name, AppCategory.id != category_id)
            )
            result = await self.db.execute(stmt)
            existing = result.scalars().first()

            if existing:
                raise ValueError(f"应用类别 '{name}' 已存在")

        # 更新类别
        category.name = name
        category.productivity_type = productivity_type

        await self.db.commit()
        await self.db.refresh(category)

        return category

    async def delete_app_category(self, category_id: int) -> bool:
        """删除应用类别"""
        # 获取要删除的类别
        category = await self.get_app_category_by_id(category_id)
        if not category:
            return False

        # 检查是否有关联的应用使用记录
        stmt = (
            select(func.count())
            .select_from(HourlyAppUsage)
            .where(HourlyAppUsage.category_id == category_id)
        )
        result = await self.db.execute(stmt)
        usage_count = result.scalar()

        if usage_count > 0:
            raise ValueError(f"无法删除类别，存在 {usage_count} 条关联的应用使用记录")

        # 删除类别
        await self.db.delete(category)
        await self.db.commit()

        return True

    # 小时应用使用统计相关方法
    def create_hourly_app_usage(self, data: Dict[str, Any]) -> HourlyAppUsage:
        """
        创建小时应用使用统计
        """
        db_usage = HourlyAppUsage(**data)
        self.db.add(db_usage)
        self.db.commit()
        self.db.refresh(db_usage)
        return db_usage

    def get_hourly_app_usage_by_id(self, usage_id: int) -> Optional[HourlyAppUsage]:
        """
        根据ID获取小时应用使用统计
        """
        return (
            self.db.query(HourlyAppUsage).filter(HourlyAppUsage.id == usage_id).first()
        )

    def get_hourly_app_usage_by_user_time_app(
        self, user_id: str, timestamp: datetime, app_name: str
    ) -> Optional[HourlyAppUsage]:
        """
        根据用户ID、时间戳和应用名称获取小时应用使用统计
        """
        return (
            self.db.query(HourlyAppUsage)
            .filter(
                HourlyAppUsage.user_id == user_id,
                HourlyAppUsage.timestamp == timestamp,
                HourlyAppUsage.app_name == app_name,
            )
            .first()
        )

    # 应用使用时间相关方法
    async def record_hourly_app_usage(
        self,
        app_name: str,
        category_id: int,
        usage_date: date,
        hour: int,
        duration_minutes: float,
    ) -> HourlyAppUsage:
        """记录应用使用时间"""
        # 验证类别是否存在
        category = await self.get_app_category_by_id(category_id)
        if not category:
            raise ValueError(f"应用类别ID {category_id} 不存在")

        # 验证小时值是否有效
        if hour < 0 or hour > 23:
            raise ValueError("小时值必须在0-23之间")

        # 检查是否已存在相同记录
        stmt = select(HourlyAppUsage).where(
            and_(
                HourlyAppUsage.app_name == app_name,
                HourlyAppUsage.category_id == category_id,
                HourlyAppUsage.usage_date == usage_date,
                HourlyAppUsage.hour == hour,
            )
        )
        result = await self.db.execute(stmt)
        existing = result.scalars().first()

        if existing:
            # 更新现有记录
            existing.duration_minutes = duration_minutes
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        # 创建新记录
        new_usage = HourlyAppUsage(
            app_name=app_name,
            category_id=category_id,
            usage_date=usage_date,
            hour=hour,
            duration_minutes=duration_minutes,
        )

        self.db.add(new_usage)
        await self.db.commit()
        await self.db.refresh(new_usage)

        return new_usage

    async def batch_record_hourly_app_usage(
        self, usage_records: List[Dict[str, Any]]
    ) -> List[HourlyAppUsage]:
        """批量记录应用使用时间"""
        results = []

        for record in usage_records:
            try:
                usage = await self.record_hourly_app_usage(
                    app_name=record["app_name"],
                    category_id=record["category_id"],
                    usage_date=record["usage_date"],
                    hour=record["hour"],
                    duration_minutes=record["duration_minutes"],
                )
                results.append(usage)
            except Exception as e:
                # 记录错误但继续处理其他记录
                print(f"记录应用使用时间失败: {str(e)}")

        return results

    async def get_hourly_app_usage(
        self,
        start_date: date,
        end_date: date,
        app_name: Optional[str] = None,
        category_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[HourlyAppUsage], int]:
        """获取应用使用时间记录"""
        # 构建基本查询
        query = select(HourlyAppUsage).where(
            and_(
                HourlyAppUsage.usage_date >= start_date,
                HourlyAppUsage.usage_date <= end_date,
            )
        )

        count_query = (
            select(func.count())
            .select_from(HourlyAppUsage)
            .where(
                and_(
                    HourlyAppUsage.usage_date >= start_date,
                    HourlyAppUsage.usage_date <= end_date,
                )
            )
        )

        # 添加筛选条件
        if app_name:
            query = query.where(HourlyAppUsage.app_name == app_name)
            count_query = count_query.where(HourlyAppUsage.app_name == app_name)

        if category_id:
            query = query.where(HourlyAppUsage.category_id == category_id)
            count_query = count_query.where(HourlyAppUsage.category_id == category_id)

        # 添加排序和分页
        query = (
            query.order_by(
                HourlyAppUsage.usage_date.desc(),
                HourlyAppUsage.hour.desc(),
                HourlyAppUsage.app_name,
            )
            .offset(skip)
            .limit(limit)
        )

        # 执行查询
        result = await self.db.execute(query)
        count_result = await self.db.execute(count_query)

        usage_records = result.scalars().all()
        total = count_result.scalar()

        return usage_records, total

    async def get_productivity_summary(
        self, start_date: date, end_date: date
    ) -> Tuple[float, float, float]:
        """获取生产力统计摘要"""
        # 查询各生产力类型的总使用时间
        query = (
            select(
                AppCategory.productivity_type, func.sum(HourlyAppUsage.duration_minutes)
            )
            .join(AppCategory, HourlyAppUsage.category_id == AppCategory.id)
            .where(
                and_(
                    HourlyAppUsage.usage_date >= start_date,
                    HourlyAppUsage.usage_date <= end_date,
                )
            )
            .group_by(AppCategory.productivity_type)
        )

        result = await self.db.execute(query)

        # 初始化各类型时间
        productive_minutes = 0.0
        neutral_minutes = 0.0
        distracting_minutes = 0.0

        # 处理查询结果
        for row in result:
            productivity_type, minutes = row

            if productivity_type == ProductivityType.PRODUCTIVE:
                productive_minutes = minutes
            elif productivity_type == ProductivityType.NEUTRAL:
                neutral_minutes = minutes
            elif productivity_type == ProductivityType.DISTRACTING:
                distracting_minutes = minutes

        return productive_minutes, neutral_minutes, distracting_minutes

    async def get_daily_app_usage(
        self, start_date: date, end_date: date
    ) -> List[Dict[str, Any]]:
        """获取每日应用使用时间统计"""
        # 查询每日应用使用时间
        query = (
            select(
                HourlyAppUsage.usage_date,
                HourlyAppUsage.app_name,
                HourlyAppUsage.category_id,
                AppCategory.name.label("category_name"),
                AppCategory.productivity_type,
                func.sum(HourlyAppUsage.duration_minutes).label("total_minutes"),
            )
            .join(AppCategory, HourlyAppUsage.category_id == AppCategory.id)
            .where(
                and_(
                    HourlyAppUsage.usage_date >= start_date,
                    HourlyAppUsage.usage_date <= end_date,
                )
            )
            .group_by(
                HourlyAppUsage.usage_date,
                HourlyAppUsage.app_name,
                HourlyAppUsage.category_id,
                AppCategory.name,
                AppCategory.productivity_type,
            )
            .order_by(HourlyAppUsage.usage_date, desc("total_minutes"))
        )

        result = await self.db.execute(query)

        # 处理查询结果
        daily_usage = []
        for row in result:
            daily_usage.append(
                {
                    "date": row.usage_date.isoformat(),
                    "app_name": row.app_name,
                    "category_id": row.category_id,
                    "category_name": row.category_name,
                    "productivity_type": row.productivity_type,
                    "total_minutes": row.total_minutes,
                }
            )

        return daily_usage

    # 从UI监控数据生成小时应用使用统计
    async def generate_hourly_app_usage_from_ui_monitoring(
        self, user_id: str, start_time: datetime, end_time: datetime
    ) -> List[HourlyAppUsage]:
        """
        从UI监控数据生成小时应用使用统计
        """
        if not self.es_client:
            logger.error("ES client not provided, cannot generate hourly app usage")
            return []

        # 查询UI监控数据
        try:
            query = {
                "bool": {
                    "must": [
                        {"term": {"client_id": user_id}},
                        {
                            "range": {
                                "timestamp": {
                                    "gte": start_time.isoformat(),
                                    "lte": end_time.isoformat(),
                                }
                            }
                        },
                    ]
                }
            }

            index_name = f"{settings.ES_INDEX_PREFIX}-ui-monitoring"
            result = await self.es_client.search(
                index=index_name,
                body={
                    "query": query,
                    "sort": [{"timestamp": "asc"}],
                    "size": 10000,  # 获取足够多的数据进行分析
                },
            )

            # 处理数据，按小时分组
            items = [hit["_source"] for hit in result["hits"]["hits"]]
            hourly_data = self._process_hourly_app_usage(items, user_id)

            # 保存到数据库
            created_usages = []
            for hour_data in hourly_data:
                # 检查是否已存在
                existing = self.get_hourly_app_usage_by_user_time_app(
                    user_id=hour_data["user_id"],
                    timestamp=hour_data["timestamp"],
                    app_name=hour_data["app_name"],
                )

                if existing:
                    # 更新现有记录
                    self.update_hourly_app_usage(existing.id, hour_data)
                    created_usages.append(existing)
                else:
                    # 创建新记录
                    created = self.create_hourly_app_usage(hour_data)
                    created_usages.append(created)

            return created_usages

        except Exception as e:
            logger.error(f"Error generating hourly app usage: {e}")
            return []

    def _process_hourly_app_usage(self, items, user_id):
        """
        处理UI监控数据，计算每小时的应用使用情况
        """
        # 按小时和应用分组
        hour_app_groups = {}

        for item in items:
            # 解析时间戳
            timestamp = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
            # 获取小时开始时间
            hour_start = timestamp.replace(minute=0, second=0, microsecond=0)

            # 创建小时-应用键
            key = (hour_start, item["app"])

            if key not in hour_app_groups:
                hour_app_groups[key] = []

            hour_app_groups[key].append(item)

        # 计算每小时每个应用的使用情况
        hourly_app_usage = []

        for (hour_start, app_name), items in hour_app_groups.items():
            # 按窗口分组
            window_groups = {}
            for item in items:
                window = item.get("window", "")
                if window not in window_groups:
                    window_groups[window] = []
                window_groups[window].append(item)

            # 合并窗口数据
            total_time = 0
            active_time = 0
            session_count = 0

            for window, window_items in window_groups.items():
                # 简单计算：假设每条记录代表一段时间的使用
                # 实际情况可能需要更复杂的算法
                window_time = len(window_items) * 60  # 假设每条记录代表60秒
                total_time += window_time

                # 估算活跃时间（这里简化处理）
                active_time += window_time * 0.8

                # 估算会话数（这里简化处理）
                session_count += 1

            # 创建小时应用使用记录
            hour_usage = {
                "user_id": user_id,
                "timestamp": hour_start,
                "hour_of_day": hour_start.hour,
                "day_of_week": hour_start.weekday(),
                "is_working_hour": 9 <= hour_start.hour <= 18,  # 简单判断工作时间
                "app_name": app_name,
                "window_name": ", ".join(window_groups.keys())[:255],  # 限制长度
                "total_time_seconds": total_time,
                "active_time_seconds": active_time,
                "session_count": session_count,
                "avg_session_time": (
                    total_time / session_count if session_count > 0 else 0
                ),
                "switch_count": len(items) - 1 if len(items) > 1 else 0,
                "concurrent_apps": 1.0,  # 简化处理
                "device_os": items[0].get("os", ""),
                "device_os_version": items[0].get("os_version", ""),
            }

            hourly_app_usage.append(hour_usage)

        return hourly_app_usage
