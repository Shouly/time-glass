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
    
    # 其他配置
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

settings = Settings() 