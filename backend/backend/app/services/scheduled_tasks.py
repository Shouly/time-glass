import asyncio
import logging
from datetime import datetime, timedelta

from ..core.config import settings
from ..db.elasticsearch import get_es_client
from ..db.mysql import AsyncSessionLocal
from ..services.usage_analysis_service import UsageAnalysisService

logger = logging.getLogger(__name__)


async def process_unprocessed_app_usage_reports(hours_back: int = 24):
    """
    处理未处理的应用使用报告

    Args:
        hours_back: 处理多少小时前的报告
    """
    try:
        # 使用异步上下文管理器获取数据库会话
        async with AsyncSessionLocal() as db:
            try:
                # 获取ES客户端
                es_client = await get_es_client()

                # 创建使用分析服务
                usage_analysis_service = UsageAnalysisService(db, es_client)

                # 处理未处理的报告
                await usage_analysis_service.process_unprocessed_reports(hours_back)

                logger.info(
                    f"Completed processing unprocessed app usage reports from the past {hours_back} hours"
                )

            except Exception as e:
                logger.error(
                    f"Error in scheduled task process_unprocessed_app_usage_reports: {e}"
                )
                raise

    except Exception as e:
        logger.error(
            f"Error in scheduled task process_unprocessed_app_usage_reports: {e}"
        )


async def schedule_tasks():
    """
    调度定时任务
    """
    while True:
        try:
            # 每小时处理一次未处理的报告
            await process_unprocessed_app_usage_reports(hours_back=24)

            logger.info("Scheduled task completed successfully")

        except Exception as e:
            logger.error(f"Error in scheduled tasks: {e}")

        # 等待1小时
        await asyncio.sleep(3600)  # 3600秒 = 1小时
