# Time Glass 系统设计文档

## 系统概述

Time Glass 是一个时间管理与分析平台，用于帮助用户追踪和分析他们的时间使用情况。系统包括UI监控功能，可以记录用户在不同应用和窗口中的活动，并提供数据分析和可视化功能。

## 系统架构

### 后端架构 (Python/FastAPI)

后端采用 FastAPI 框架构建，使用 Elasticsearch 作为数据存储，实现了一个可扩展的 RESTful API 服务。

#### 目录结构

```
backend/
├── backend/
│   ├── app/
│   │   ├── api/                # API路由和端点
│   │   │   ├── endpoints/      # 具体API端点实现
│   │   │   │   ├── data.py     # 数据上报API
│   │   │   │   └── query.py    # 数据查询API
│   │   │   └── api.py          # API路由注册
│   │   ├── core/               # 核心配置
│   │   ├── db/                 # 数据库连接
│   │   │   └── elasticsearch.py # ES连接和索引管理
│   │   ├── models/             # 数据模型
│   │   ├── services/           # 业务逻辑服务
│   │   │   ├── data_service.py # 数据处理服务
│   │   │   └── query_service.py # 查询服务
│   │   └── main.py             # 应用入口
├── scripts/                    # 辅助脚本
└── tools/                      # 工具脚本
```

#### 关键组件

1. **API层**：
   - `api/endpoints/data.py`: 处理数据上报请求
   - `api/endpoints/query.py`: 处理数据查询请求

2. **服务层**：
   - `services/data_service.py`: 处理数据存储和处理逻辑
   - `services/query_service.py`: 实现数据查询逻辑

3. **数据库层**：
   - `db/elasticsearch.py`: 管理与Elasticsearch的连接和索引

### 前端架构 (Next.js/React)

前端采用 Next.js 框架构建，使用 React 组件和 Tailwind CSS 进行UI开发，实现了一个现代化的用户界面。

#### 目录结构

```
frontend/
├── app/                        # App Router页面
│   ├── about/                  # 关于页面
│   ├── dashboard/              # 仪表盘页面
│   ├── globals.css             # 全局样式
│   ├── layout.tsx              # 应用布局
│   └── page.tsx                # 首页
├── components/                 # 组件
│   ├── layout/                 # 布局组件
│   │   ├── header.tsx          # 页头组件
│   │   └── footer.tsx          # 页脚组件
│   ├── ui/                     # UI组件 (shadcn/ui)
│   └── ui-monitoring/          # UI监控组件
│       ├── UiMonitoringFilter.tsx # 筛选组件
│       ├── UiMonitoringList.tsx   # 数据列表组件
│       └── UiMonitoringPage.tsx   # 页面组件
├── lib/                        # 工具库
│   ├── api.ts                  # API调用
│   └── utils.ts                # 工具函数
└── pages/                      # Pages Router页面
    └── ui-monitoring.tsx       # UI监控页面
```

#### 关键组件

1. **页面组件**：
   - `pages/ui-monitoring.tsx`: UI监控页面入口
   - `app/page.tsx`: 首页
   - `app/dashboard/page.tsx`: 仪表盘页面

2. **UI监控组件**：
   - `components/ui-monitoring/UiMonitoringFilter.tsx`: 筛选条件组件
   - `components/ui-monitoring/UiMonitoringList.tsx`: 数据列表组件
   - `components/ui-monitoring/UiMonitoringPage.tsx`: 页面主组件

3. **API服务**：
   - `lib/api.ts`: 封装了与后端API的交互

## 数据流

1. **数据收集流程**：
   - 客户端收集UI监控数据
   - 通过 `/api/v1/data/report` 端点上报数据
   - `DataService` 处理并存储数据到 Elasticsearch

2. **数据查询流程**：
   - 用户在前端设置筛选条件
   - 前端通过 `api.ts` 调用后端API
   - 后端 `QueryService` 从 Elasticsearch 查询数据
   - 数据返回前端并在 `UiMonitoringList` 中展示

## 关键功能

### UI监控功能

1. **数据筛选**：
   - 按客户端ID筛选
   - 按应用程序筛选
   - 按窗口名称筛选
   - 按时间范围筛选

2. **数据展示**：
   - 分页展示UI监控数据
   - 展示详细信息，包括时间戳、应用、窗口、文本内容等
   - 支持展开查看更多详情

### 数据分析功能

1. **仪表盘**：
   - 展示时间使用统计
   - 展示应用使用分布
   - 展示生产力分析

## 技术栈

### 后端

- **框架**: FastAPI
- **数据库**: Elasticsearch
- **依赖注入**: FastAPI依赖系统
- **异步处理**: Python asyncio

### 前端

- **框架**: Next.js 15
- **UI库**: React 19
- **样式**: Tailwind CSS
- **组件库**: shadcn/ui
- **HTTP客户端**: Axios
- **日期处理**: date-fns

## 开发规范

### 后端规范

1. **API设计**:
   - 使用RESTful风格
   - 路径前缀: `/api/v1/`
   - 查询相关: `/api/v1/query/*`
   - 数据相关: `/api/v1/data/*`

2. **代码组织**:
   - 使用依赖注入获取服务实例
   - 业务逻辑放在service层
   - API路由处理放在endpoints层

### 前端规范

1. **组件设计**:
   - 使用函数式组件和React Hooks
   - 客户端组件使用 "use client" 指令
   - 组件按功能分组

2. **状态管理**:
   - 使用React状态钩子管理局部状态
   - 通过props传递数据和回调

3. **样式规范**:
   - 使用Tailwind CSS实用类
   - 使用shadcn/ui组件库
   - 响应式设计，支持移动设备

## 部署说明

### 后端部署

1. 确保Elasticsearch服务可用
2. 设置环境变量（见.env.example）
3. 运行 `python run.py`

### 前端部署

1. 设置环境变量 `NEXT_PUBLIC_API_URL`
2. 构建: `npm run build`
3. 启动: `npm run start`

## 扩展计划

1. 添加用户认证系统
2. 增强数据分析功能
3. 添加团队协作功能
4. 实现更多数据可视化
5. 添加自动化报告功能 