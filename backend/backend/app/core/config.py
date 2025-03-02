import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# 加载.env文件
load_dotenv()

class Settings(BaseSettings):
    # API配置
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Time Glass API"
    
    # Elasticsearch配置
    ES_URL: str = os.getenv("ES_URL", "http://es-sg-6l13oji530003k7jw.public.elasticsearch.aliyuncs.com:9200")
    ES_USER: str = os.getenv("ES_USER", "elastic")
    ES_PWD: str = os.getenv("ES_PWD", "TO&YhXowzIVC")
    
    # 索引配置
    ES_INDEX_PREFIX: str = "timeglass"
    
    # MySQL数据库配置
    MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "password")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "timeglass")
    MYSQL_DATABASE_URL: str = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
    
    # 定时任务配置
    ENABLE_SCHEDULED_TASKS: bool = os.getenv("ENABLE_SCHEDULED_TASKS", "True").lower() == "true"
    
    # 其他配置
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

settings = Settings() 