import logging
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from elasticsearch import AsyncElasticsearch
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..models.app_usage import AppCategory, HourlyAppUsage
from ..models.data import DataReport
from ..services.app_usage_service import AppUsageService, ProductivityType

logger = logging.getLogger(__name__)


class UsageAnalysisService:
    def __init__(self, db: AsyncSession, es_client: AsyncElasticsearch):
        self.db = db
        self.es_client = es_client
        self.app_usage_service = AppUsageService(db, es_client)

    async def process_report_for_app_usage(self, report: DataReport, report_id: str):
        """
        处理数据报告，提取应用使用信息并生成统计数据

        Args:
            report: 数据报告对象
            report_id: 报告ID
        """
        try:
            # 1. 提取报告中的时间范围
            start_time = report.metadata.reportingPeriod.start
            end_time = report.metadata.reportingPeriod.end
            client_id = report.clientId

            # 2. 从报告中提取UI监控数据
            app_usage_data = self._extract_app_usage_from_ui_monitoring(report)

            # 3. 生成小时级别的应用使用统计
            hourly_usage_records = await self._generate_hourly_usage_records(
                client_id, start_time, end_time, app_usage_data
            )

            # 4. 批量保存应用使用统计
            if hourly_usage_records:
                await self.app_usage_service.batch_record_hourly_app_usage(
                    hourly_usage_records
                )

                # 5. 标记报告为已处理
                await self._mark_report_as_processed(report_id)

            logger.info(f"Successfully processed app usage data for report {report_id}")

        except Exception as e:
            logger.error(f"Error processing app usage data for report {report_id}: {e}")
            raise

    def _extract_app_usage_from_ui_monitoring(self, report: DataReport) -> List[Dict]:
        """
        从UI监控数据中提取应用使用信息

        Args:
            report: 数据报告对象

        Returns:
            List[Dict]: 应用使用数据列表
        """
        app_usage_data = []

        # 从UI监控数据中提取
        for ui_item in report.data.uiMonitoring:
            app_usage_data.append(
                {
                    "timestamp": ui_item.timestamp,
                    "app_name": ui_item.app,
                    "window_name": ui_item.window,
                    "duration": 0,  # 初始化持续时间为0
                    "is_active": True,  # 假设所有记录的UI都是活跃的
                }
            )

        # 计算每个应用的使用时间
        app_usage_data = self._calculate_app_usage_duration(app_usage_data)

        return app_usage_data

    def _calculate_app_usage_duration(self, app_usage_data: List[Dict]) -> List[Dict]:
        """
        计算应用使用时间

        Args:
            app_usage_data: 应用使用数据列表

        Returns:
            List[Dict]: 更新后的应用使用数据列表，包含使用时间
        """
        # 按时间戳排序
        app_usage_data.sort(key=lambda x: x["timestamp"])

        # 如果只有一条记录，无法计算持续时间
        if len(app_usage_data) <= 1:
            return app_usage_data

        # 计算每条记录的持续时间（到下一条记录的时间差）
        for i in range(len(app_usage_data) - 1):
            current = app_usage_data[i]
            next_record = app_usage_data[i + 1]

            # 计算时间差（秒）
            time_diff = (
                next_record["timestamp"] - current["timestamp"]
            ).total_seconds()

            # 设置持续时间
            current["duration"] = time_diff

        # 最后一条记录的持续时间设为0或使用平均值
        if len(app_usage_data) > 1:
            avg_duration = sum(item["duration"] for item in app_usage_data[:-1]) / (
                len(app_usage_data) - 1
            )
            app_usage_data[-1]["duration"] = min(
                avg_duration, 5
            )  # 使用平均值，但不超过5秒

        return app_usage_data

    async def _generate_hourly_usage_records(
        self,
        client_id: str,
        start_time: datetime,
        end_time: datetime,
        app_usage_data: List[Dict],
    ) -> List[Dict]:
        """
        生成小时级别的应用使用统计记录

        Args:
            client_id: 客户端ID
            start_time: 开始时间 (UTC，仅用于日志)
            end_time: 结束时间 (UTC，仅用于日志)
            app_usage_data: 应用使用数据列表，其中timestamp字段是北京时间

        Returns:
            List[Dict]: 小时级别的应用使用统计记录
        """
        hourly_app_data = {}

        # 按应用和小时聚合数据
        for item in app_usage_data:
            timestamp = item["timestamp"]  # 这里的timestamp是北京时间
            app_name = item["app_name"]
            window_name = item["window_name"]
            duration = item["duration"]
            is_active = item["is_active"]

            # 生成小时键（应用名+时间戳的小时部分）
            hour_key = f"{app_name}_{timestamp.strftime('%Y-%m-%d_%H')}"
            hour_timestamp = datetime(
                timestamp.year, timestamp.month, timestamp.day, timestamp.hour
            )

            # 初始化该小时的应用数据
            if hour_key not in hourly_app_data:
                hourly_app_data[hour_key] = {
                    "app_name": app_name,
                    "window_name": window_name,  # 使用最后一个窗口名
                    "timestamp": hour_timestamp,  # 这是北京时间的小时时间戳
                    "hour_of_day": timestamp.hour,
                    "day_of_week": timestamp.weekday(),
                    "is_working_hour": self._is_working_hour(timestamp),
                    "total_time_seconds": 0,
                    "active_time_seconds": 0,
                    "session_count": 0,
                    "last_timestamp": None,
                    "sessions": [],
                }

            # 更新统计数据
            hourly_data = hourly_app_data[hour_key]
            hourly_data["total_time_seconds"] += duration

            if is_active:
                hourly_data["active_time_seconds"] += duration

            # 会话计算
            if (
                hourly_data["last_timestamp"] is None
                or (timestamp - hourly_data["last_timestamp"]).total_seconds() > 60
            ):  # 如果间隔超过60秒，认为是新会话
                hourly_data["session_count"] += 1
                hourly_data["sessions"].append(
                    {"start": timestamp, "end": timestamp, "duration": 0}
                )
            elif len(hourly_data["sessions"]) > 0:
                # 更新最后一个会话的结束时间和持续时间
                last_session = hourly_data["sessions"][-1]
                last_session["end"] = timestamp
                last_session["duration"] = (
                    last_session["end"] - last_session["start"]
                ).total_seconds()

            hourly_data["last_timestamp"] = timestamp
            hourly_data["window_name"] = window_name  # 更新为最新的窗口名

        # 转换为最终的记录格式
        hourly_records = []

        for hour_key, hourly_data in hourly_app_data.items():
            # 计算平均会话时间
            total_session_duration = sum(
                session["duration"] for session in hourly_data["sessions"]
            )
            avg_session_time = (
                total_session_duration / hourly_data["session_count"]
                if hourly_data["session_count"] > 0
                else 0
            )

            # 匹配应用类别 - 这里已经返回类别ID
            app_category_id = await self._match_app_category(hourly_data["app_name"])

            # 创建记录 - 注意timestamp是北京时间
            record = {
                "app_name": hourly_data["app_name"],
                "category_id": app_category_id,
                "usage_date": hourly_data["timestamp"].date(),  # 使用北京时间的日期
                "hour": hourly_data["hour_of_day"],  # 使用北京时间的小时
                "duration_minutes": round(
                    hourly_data["total_time_seconds"] / 60, 2
                ),  # 转换为分钟
                "client_id": client_id,
            }

            hourly_records.append(record)

        return hourly_records

    def _is_working_hour(self, timestamp: datetime) -> bool:
        """
        判断是否是工作时间（默认工作日9:00-18:00）

        Args:
            timestamp: 时间戳 (北京时间)

        Returns:
            bool: 是否是工作时间
        """
        # 注意：timestamp是北京时间，直接使用它进行工作时间判断

        # 工作日（周一到周五）
        is_weekday = timestamp.weekday() < 5
        # 工作时间（9:00-18:00）
        is_work_time = 9 <= timestamp.hour < 18

        return is_weekday and is_work_time

    async def _match_app_category(self, app_name: str) -> int:
        """
        匹配应用类别

        Args:
            app_name: 应用名称

        Returns:
            int: 类别ID
        """
        try:
            # 直接查询精确匹配的类别
            exact_query = select(AppCategory).where(AppCategory.name.ilike(app_name))
            result = await self.db.execute(exact_query)
            category = result.scalars().first()

            if category:
                return category.id

            # 尝试部分匹配
            # 由于SQLAlchemy不支持直接的包含查询，我们获取所有类别然后在Python中过滤
            all_query = select(AppCategory)
            result = await self.db.execute(all_query)
            all_categories = result.scalars().all()

            app_name_lower = app_name.lower()
            for category in all_categories:
                category_name_lower = category.name.lower()
                if (
                    category_name_lower in app_name_lower
                    or app_name_lower in category_name_lower
                ):
                    return category.id

            # 如果没有匹配，获取默认类别ID
            default_category_id = await self._get_or_create_default_category()
            return default_category_id

        except Exception as e:
            logger.error(f"Error matching app category for {app_name}: {e}")
            # 如果出错，返回默认类别ID
            try:
                default_category_id = await self._get_or_create_default_category()
                return default_category_id
            except Exception as inner_e:
                logger.error(f"Error getting default category as fallback: {inner_e}")
                # 最后的后备方案：返回ID为1的类别
                return 1

    async def _get_or_create_default_category(self) -> int:
        """
        获取或创建默认类别

        Returns:
            int: 类别ID
        """
        try:
            # 尝试获取"未分类"类别
            query = select(AppCategory).where(AppCategory.name == "未分类")
            result = await self.db.execute(query)
            category = result.scalars().first()

            if category:
                return category.id  # 返回类别ID

            # 如果不存在，创建默认类别
            default_category = await self.app_usage_service.create_app_category(
                name="未分类", productivity_type=ProductivityType.NEUTRAL
            )

            return default_category.id  # 返回类别ID

        except Exception as e:
            logger.error(f"Error getting or creating default category: {e}")
            # 如果出错，返回ID为1的类别（假设总是存在）
            return 1

    async def _mark_report_as_processed(self, report_id: str):
        """
        标记报告为已处理

        Args:
            report_id: 报告ID
        """
        try:
            # 构建查询
            query = {"bool": {"must": [{"term": {"report_id": report_id}}]}}

            # 执行查询
            indices = f"{settings.ES_INDEX_PREFIX}-data-*"
            result = await self.es_client.search(index=indices, query=query, size=1)

            # 检查是否找到报告
            if result["hits"]["total"]["value"] > 0:
                # 获取文档ID和索引
                doc_id = result["hits"]["hits"][0]["_id"]
                index = result["hits"]["hits"][0]["_index"]

                # 更新文档
                await self.es_client.update(
                    index=index,
                    id=doc_id,
                    doc={
                        "app_usage_processed": True,
                        "app_usage_processed_at": datetime.utcnow().isoformat(),
                    },
                )

                logger.info(f"Marked report {report_id} as processed")

        except Exception as e:
            logger.error(f"Error marking report {report_id} as processed: {e}")

    async def process_unprocessed_reports(self, hours_back: int = 24):
        """
        处理未处理的数据报告

        Args:
            hours_back: 处理多少小时前的报告
        """
        try:
            # 获取过去指定小时的未处理报告
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=hours_back)

            # 查询未处理的报告
            unprocessed_reports = await self._get_unprocessed_reports(
                start_time, end_time
            )

            logger.info(f"Found {len(unprocessed_reports)} unprocessed reports")

            # 处理每个报告
            for report in unprocessed_reports:
                try:
                    # 从ES中获取完整报告
                    full_report = await self._get_full_report(report["report_id"])

                    if full_report:
                        # 处理报告
                        await self.process_report_for_app_usage(
                            full_report, report["report_id"]
                        )

                except Exception as e:
                    logger.error(f"Error processing report {report['report_id']}: {e}")

        except Exception as e:
            logger.error(f"Error processing unprocessed reports: {e}")

    async def _get_unprocessed_reports(
        self, start_time: datetime, end_time: datetime
    ) -> List[Dict[str, Any]]:
        """
        获取未处理的报告

        Args:
            start_time: 开始时间
            end_time: 结束时间

        Returns:
            List[Dict[str, Any]]: 未处理的报告列表
        """
        # 构建查询
        query = {
            "bool": {
                "must": [
                    {
                        "range": {
                            "timestamp": {
                                "gte": start_time.isoformat(),
                                "lte": end_time.isoformat(),
                            }
                        }
                    }
                ],
                "must_not": [{"exists": {"field": "app_usage_processed"}}],
            }
        }

        # 执行查询
        indices = f"{settings.ES_INDEX_PREFIX}-data-*"
        result = await self.es_client.search(
            index=indices, query=query, _source=["report_id", "timestamp"], size=100
        )

        # 提取报告ID
        reports = []
        for hit in result["hits"]["hits"]:
            reports.append(
                {
                    "report_id": hit["_source"]["report_id"],
                    "timestamp": hit["_source"]["timestamp"],
                }
            )

        return reports

    async def _get_full_report(self, report_id: str) -> Optional[DataReport]:
        """
        获取完整报告

        Args:
            report_id: 报告ID

        Returns:
            Optional[DataReport]: 完整报告对象
        """
        try:
            # 构建查询
            query = {"bool": {"must": [{"term": {"report_id": report_id}}]}}

            # 执行查询
            indices = f"{settings.ES_INDEX_PREFIX}-data-*"
            result = await self.es_client.search(index=indices, query=query, size=1)

            # 检查是否找到报告
            if result["hits"]["total"]["value"] > 0:
                # 获取报告数据
                report_data = result["hits"]["hits"][0]["_source"]

                # 转换为DataReport对象
                from ..models.data import DataReport

                report = DataReport.model_validate(report_data)

                return report

            return None

        except Exception as e:
            logger.error(f"Error getting full report {report_id}: {e}")
            return None

    async def recalculate_hourly_statistics(
        self, hours_back: int = 24, client_id: str = None
    ):
        """
        重新计算过去几个小时的应用使用统计

        Args:
            hours_back: 重新计算多少小时前的数据
            client_id: 客户端ID，如果为None则处理所有客户端
        """
        try:
            # 计算时间范围 - 使用UTC时间
            end_time_utc = datetime.utcnow()
            start_time_utc = end_time_utc - timedelta(hours=hours_back)

            logger.info(
                f"开始重新计算从 {start_time_utc} UTC 到 {end_time_utc} UTC 的小时应用使用统计"
            )

            # 从ES中获取原始UI监控数据
            from ..services.query_service import QueryService

            query_service = QueryService(self.es_client)

            # 获取需要处理的客户端列表
            client_ids = (
                [client_id]
                if client_id
                else await self._get_active_client_ids(start_time_utc, end_time_utc)
            )

            for cid in client_ids:
                logger.info(f"处理客户端 {cid} 的数据")

                # 获取该客户端在时间范围内的所有UI监控数据
                ui_data = await query_service.get_ui_monitoring_by_time(
                    client_id=cid,
                    start_time=start_time_utc,
                    end_time=end_time_utc,
                    limit=10000,  # 设置一个较大的限制以获取所有数据
                )

                if not ui_data or "items" not in ui_data or not ui_data["items"]:
                    logger.info(f"客户端 {cid} 在指定时间范围内没有UI监控数据")
                    continue

                # 提取并处理UI监控数据
                app_usage_data = []
                for item in ui_data["items"]:
                    # ES中的时间戳格式如 "Mar 2, 2025 @ 15:20:24.000"，直接是北京时间
                    timestamp_str = item["timestamp"]

                    # 解析时间戳
                    try:
                        if isinstance(timestamp_str, str):
                            if "T" in timestamp_str or "+" in timestamp_str:
                                # ISO格式
                                timestamp = datetime.fromisoformat(
                                    timestamp_str.replace("Z", "+00:00")
                                )
                            elif "@" in timestamp_str:
                                # ES特有格式 "Mar 2, 2025 @ 15:20:24.000"
                                clean_ts = timestamp_str.replace(" @ ", " ")
                                timestamp = datetime.strptime(
                                    clean_ts, "%b %d, %Y %H:%M:%S.%f"
                                )
                            else:
                                # 尝试其他格式
                                timestamp = datetime.fromisoformat(timestamp_str)
                        elif isinstance(timestamp_str, datetime):
                            timestamp = timestamp_str
                        else:
                            logger.warning(
                                f"未知时间戳类型: {type(timestamp_str)}，使用当前北京时间"
                            )
                            timestamp = datetime.utcnow() + timedelta(hours=8)
                    except ValueError as e:
                        logger.warning(
                            f"无法解析时间戳: {timestamp_str}，错误: {e}，使用当前北京时间"
                        )
                        timestamp = datetime.utcnow() + timedelta(hours=8)

                    app_usage_data.append(
                        {
                            "timestamp": timestamp,  # 这里的timestamp是北京时间
                            "app_name": item["app"],
                            "window_name": item.get("window", ""),
                            "duration": 0,  # 初始化持续时间为0
                            "is_active": True,  # 假设所有记录的UI都是活跃的
                        }
                    )

                # 计算持续时间
                app_usage_data = self._calculate_app_usage_duration(app_usage_data)

                # 生成小时级别的应用使用统计
                hourly_usage_records = await self._generate_hourly_usage_records(
                    cid, start_time_utc, end_time_utc, app_usage_data
                )

                # 清除该客户端在时间范围内的现有记录
                await self._clear_existing_hourly_records(
                    cid, start_time_utc, end_time_utc
                )

                # 批量保存新的统计记录
                if hourly_usage_records:
                    await self.app_usage_service.batch_record_hourly_app_usage(
                        hourly_usage_records
                    )
                    logger.info(
                        f"为客户端 {cid} 重新计算并保存了 {len(hourly_usage_records)} 条小时应用使用统计"
                    )
                else:
                    logger.info(f"客户端 {cid} 没有生成小时应用使用统计记录")

            logger.info("小时应用使用统计重新计算完成")

        except Exception as e:
            logger.error(f"重新计算小时应用使用统计时出错: {e}")
            raise

    async def _get_active_client_ids(
        self, start_time: datetime, end_time: datetime
    ) -> List[str]:
        """
        获取在指定时间范围内活跃的客户端ID列表

        Args:
            start_time: 开始时间 (UTC)
            end_time: 结束时间 (UTC)

        Returns:
            List[str]: 客户端ID列表
        """
        try:
            # 注意：ES中的时间戳直接是北京时间，而start_time和end_time是UTC时间
            # 我们需要将UTC时间转换为北京时间进行比较

            # 将UTC时间转换为北京时间（UTC+8）
            beijing_start_time = start_time + timedelta(hours=8)
            beijing_end_time = end_time + timedelta(hours=8)

            # 构建查询
            query = {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "timestamp": {
                                    "gte": beijing_start_time.isoformat(),
                                    "lte": beijing_end_time.isoformat(),
                                }
                            }
                        }
                    ]
                }
            }

            # 使用聚合查询获取唯一的客户端ID
            aggs = {
                "client_ids": {
                    "terms": {
                        "field": "client_id",
                        "size": 1000,  # 设置一个较大的值以获取所有客户端
                    }
                }
            }

            # 执行查询
            index_name = f"{settings.ES_INDEX_PREFIX}-ui-monitoring"
            result = await self.es_client.search(
                index=index_name,
                body={
                    "query": query,
                    "aggs": aggs,
                    "size": 0,  # 我们只需要聚合结果，不需要具体文档
                },
            )

            # 提取客户端ID
            client_ids = []
            if "aggregations" in result and "client_ids" in result["aggregations"]:
                for bucket in result["aggregations"]["client_ids"]["buckets"]:
                    client_ids.append(bucket["key"])

            return client_ids

        except Exception as e:
            logger.error(f"获取活跃客户端ID时出错: {e}")
            return []

    async def _clear_existing_hourly_records(
        self, client_id: str, start_time: datetime, end_time: datetime
    ):
        """
        清除指定客户端在时间范围内的现有小时应用使用统计记录

        Args:
            client_id: 客户端ID
            start_time: 开始时间 (UTC)
            end_time: 结束时间 (UTC)
        """
        try:
            # 注意：数据库中的timestamp字段存储的是北京时间，而start_time和end_time是UTC时间
            # 我们需要将UTC时间转换为北京时间进行比较

            # 将UTC时间转换为北京时间（UTC+8）
            beijing_start_time = start_time + timedelta(hours=8)
            beijing_end_time = end_time + timedelta(hours=8)

            # 构建删除语句
            stmt = delete(HourlyAppUsage).where(
                HourlyAppUsage.user_id == client_id,
                HourlyAppUsage.timestamp >= beijing_start_time,
                HourlyAppUsage.timestamp <= beijing_end_time,
            )

            # 执行删除
            await self.db.execute(stmt)
            await self.db.commit()

            logger.info(
                f"已清除客户端 {client_id} 在 {start_time} 到 {end_time} 之间的现有记录"
            )

        except Exception as e:
            logger.error(f"清除现有记录时出错: {e}")
            # 回滚事务
            await self.db.rollback()
            raise
