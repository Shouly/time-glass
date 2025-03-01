# Time Glass Backend

这是Time Glass应用的后端API，使用FastAPI和Python 3.12构建，数据存储在Elasticsearch中。

## 环境要求

- Python 3.12+
- Poetry
- Elasticsearch 8.x

## 安装

1. 确保已安装Poetry：
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. 安装依赖：
   ```bash
   cd backend
   poetry install
   ```

3. 创建环境变量文件：
   ```bash
   cp .env.example .env
   ```
   然后编辑`.env`文件，设置适当的环境变量，特别是Elasticsearch连接信息。

## 运行开发服务器

```bash
poetry run python run.py
```

或者直接使用uvicorn：

```bash
poetry run uvicorn backend.app.main:app --reload
```

## API文档

启动服务器后，可以在以下URL访问API文档：

- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

## 数据上报API

主要的数据上报API端点是：

```
POST /api/v1/data/report
```

该API接收来自客户端的数据报告，包括屏幕帧、音频转录和UI监控数据，并将其存储在Elasticsearch中。

### 数据存储

数据存储在以下Elasticsearch索引中：

- `timeglass-data-YYYY.MM.DD` - 主数据索引，按日期分片
- `timeglass-ocr-text` - OCR文本专用索引
- `timeglass-audio-transcriptions` - 音频转录专用索引
- `timeglass-ui-monitoring` - UI监控专用索引

这种设计支持高效的全文搜索和时间序列分析。 