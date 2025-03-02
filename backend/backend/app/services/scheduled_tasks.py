import asyncio
import logging
from datetime import datetime, timedelta

from ..core.config import settings
from ..db.elasticsearch import get_es_client
from ..db.mysql import AsyncSessionLocal
from ..services.usage_analysis_service import UsageAnalysisService

logger = logging.getLogger(__name__)


async def recalculate_hourly_app_usage_statistics(hours_back: int = 24):
    """
    重新计算小时应用使用统计

    Args:
        hours_back: 重新计算多少小时前的数据
    """
    try:
        # 使用异步上下文管理器获取数据库会话
        async with AsyncSessionLocal() as db:
            try:
                # 获取ES客户端
                es_client = await get_es_client()

                # 创建使用分析服务
                usage_analysis_service = UsageAnalysisService(db, es_client)

                # 重新计算小时统计
                await usage_analysis_service.recalculate_hourly_statistics(hours_back)

                logger.info(
                    f"Completed recalculating hourly app usage statistics from the past {hours_back} hours"
                )

            except Exception as e:
                logger.error(
                    f"Error in scheduled task recalculate_hourly_app_usage_statistics: {e}"
                )
                raise

    except Exception as e:
        logger.error(
            f"Error in scheduled task recalculate_hourly_app_usage_statistics: {e}"
        )


async def schedule_tasks():
    """
    调度定时任务

    注意：系统处理的是北京时间（UTC+8）的数据。ES中的时间戳是北京时间，
    而我们的查询使用UTC时间，但会在查询时将其转换为北京时间进行比较。
    """
    while True:
        try:
            logger.info("开始执行定时任务")

            # 重新计算小时应用使用统计
            # 这个任务会从ES中获取原始数据并重新计算统计信息
            await recalculate_hourly_app_usage_statistics(hours_back=2)

            logger.info("定时任务执行完成")

        except Exception as e:
            logger.error(f"执行定时任务时出错: {e}")
            # 这里可以添加错误通知逻辑

        # 等待一段时间后再次执行（例如每小时执行一次）
        await asyncio.sleep(3600)  # 3600秒 = 1小时
