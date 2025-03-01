import requests
import json
import time
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_data_report_api():
    """测试数据报告API"""
    # API端点
    url = "http://localhost:8000/api/v1/data/report"
    
    logger.info(f"发送数据到 {url}...")
    
    # 加载测试数据
    with open("test_data.json", "r") as f:
        data = json.load(f)
    
    # 记录开始时间
    start_time = time.time()
    
    # 发送POST请求
    response = requests.post(url, json=data)
    
    # 计算响应时间
    response_time = time.time() - start_time
    
    # 打印结果
    logger.info(f"状态码: {response.status_code}")
    logger.info(f"响应时间: {response_time:.2f}秒")
    logger.info(f"响应内容: {response.text}")
    
    # 检查是否成功
    if response.status_code == 200:
        result = response.json()
        if "report_id" in result:
            logger.info(f"报告ID: {result['report_id']}")
    
if __name__ == "__main__":
    test_data_report_api() 