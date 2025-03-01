# TimeGlass Backend

TimeGlass是一个用于时间追踪和上下文感知的应用程序。这个仓库包含了TimeGlass的后端服务。

## 目录结构

```
backend/
├── backend/             # 主应用程序代码
│   └── app/             # FastAPI应用
│       ├── api/         # API路由
│       ├── core/        # 核心配置
│       ├── db/          # 数据库连接
│       ├── models/      # 数据模型
│       └── services/    # 业务逻辑服务
├── scripts/             # 脚本工具
│   ├── es_tools.py      # Elasticsearch工具启动脚本
│   └── run_tests.py     # 测试脚本启动器
├── tests/               # 测试文件
│   ├── test_api.py      # API测试
│   └── test_data.json   # 测试数据
├── tools/               # 工具集
│   └── es/              # Elasticsearch工具
│       ├── check_es_data.py        # 查看ES数据
│       ├── clear_es_data.py        # 清空所有索引
│       ├── clear_es_data_force.py  # 强制清空所有索引
│       ├── clear_es_index_data.py  # 清空特定索引数据
│       ├── manage_es_data.py       # 综合管理工具
│       └── README_ES_TOOLS.md      # ES工具说明
├── .env                 # 环境变量配置
├── .env.example         # 环境变量示例
├── pyproject.toml       # 项目依赖配置
└── run.py               # 应用启动脚本
```

## 环境配置

1. 确保已安装Python 3.8+和Poetry
2. 安装依赖：
   ```bash
   poetry install
   ```
3. 复制环境变量示例并修改：
   ```bash
   cp .env.example .env
   ```

## 启动服务

```bash
poetry run python run.py
```

或者使用Poetry shell：

```bash
poetry shell
python run.py
```

服务将在 http://localhost:8000 启动。

## API文档

启动服务后，可以访问以下URL查看API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 工具脚本

### Elasticsearch工具

使用`es_tools.py`脚本可以管理Elasticsearch数据：

```bash
# 查看帮助
poetry run python scripts/es_tools.py --help

# 查看ES数据
poetry run python scripts/es_tools.py check

# 清空所有索引（需要确认）
poetry run python scripts/es_tools.py clear

# 强制清空所有索引（无需确认）
poetry run python scripts/es_tools.py force-clear

# 清空特定索引数据
poetry run python scripts/es_tools.py clear-index timeglass-data-2025.03.01

# 使用综合管理工具
poetry run python scripts/es_tools.py manage list
```

更多ES工具的详细说明，请参考 [tools/es/README_ES_TOOLS.md](tools/es/README_ES_TOOLS.md)。

### 测试脚本

使用`run_tests.py`脚本可以运行各种测试：

```bash
# 查看帮助
poetry run python scripts/run_tests.py --help

# 测试API接口
poetry run python scripts/run_tests.py api
```

## 开发

### 代码风格

本项目使用Black和isort进行代码格式化：

```bash
poetry run black .
poetry run isort .
```

### 测试

运行测试：

```bash
poetry run pytest
```

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