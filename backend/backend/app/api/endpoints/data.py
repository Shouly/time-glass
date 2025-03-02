from fastapi import APIRouter, Depends, HTTPException
from elasticsearch import AsyncElasticsearch
import logging
from datetime import datetime, timedelta

from ...db.elasticsearch import get_es_client
from ...db.mysql import get_db
from ...services.data_service import DataService
from ...services.usage_analysis_service import UsageAnalysisService
from ...models.data import DataReport, DataReportResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/report", response_model=DataReportResponse)
async def report_data(
    report: DataReport,
    es_client: AsyncElasticsearch = Depends(get_es_client)
):
    """
    接收并存储客户端数据报告
    """
    try:
        # 创建数据服务
        data_service = DataService(es_client)
        
        # 存储报告
        report_id = await data_service.store_report(report)
        
        # 异步处理专门数据（可选）
        # 这可以在后台任务中执行，不阻塞响应
        await data_service.extract_and_store_specialized_data(report, report_id)
        
        # 返回成功响应
        return DataReportResponse(
            status="success",
            message="Data report received and processed successfully",
            received_at=datetime.utcnow() + timedelta(hours=8),
            report_id=report_id
        )
        
    except Exception as e:
        logger.error(f"Error processing data report: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing data report: {e}")

@router.post("/process-app-usage")
async def process_app_usage(
    hours_back: int = 24,
    es_client: AsyncElasticsearch = Depends(get_es_client),
    db = Depends(get_db)
):
    """
    手动触发处理未处理的应用使用报告
    
    Args:
        hours_back: 处理多少小时前的报告，默认24小时
    """
    try:
        # 创建使用分析服务
        usage_analysis_service = UsageAnalysisService(db, es_client)
        
        # 处理未处理的报告
        await usage_analysis_service.process_unprocessed_reports(hours_back)
        
        return {
            "status": "success",
            "message": f"Successfully processed unprocessed app usage reports from the past {hours_back} hours",
            "processed_at": datetime.utcnow()
        }
        
    except Exception as e:
        logger.error(f"Error processing app usage reports: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing app usage reports: {e}") 