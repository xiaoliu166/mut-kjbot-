# mut-kjbot 系统设计文档

**项目名称：** mut-kjbot - 通用多Agent协作平台
**版本：** v1.0
**作者：** 大管家
**日期：** 2026-03-14

---

## 一、系统概述

### 1.1 项目定位

**通用多Agent协作平台** - 支持多个AI Bot自动对话、分工协作，输出跨境全流程方案。

### 1.2 核心目标

1. 用户可以创建和配置多个AI Bot
2. Bot之间可以自动协作（链式/群聊/工具调用）
3. 支持可视化流程编排
4. 支持飞书/网页多端接入

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         用户层 (User Layer)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  飞书小程序  │  │   Web页面   │  │   API接口   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                        服务层 (Service Layer)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Bot管理服务 │  │ 流程编排服务 │  │  对话服务   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  模板服务   │  │  用户服务   │  │  日志服务   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                     编排层 (Orchestration Layer)                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    LangGraph 核心引擎                        │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │    │
│  │  │ State   │  │ Node    │  │ Checkpoint│ │ Human  │      │    │
│  │  │ Management│  │ Registry│  │ Storage  │  │ in-loop │      │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                         模型层 (Model Layer)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │   OpenAI    │  │  DeepSeek   │  │  阿里Qwen   │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 三、核心模块设计

### 3.1 Bot管理模块

**功能：** 创建、配置、管理AI Bot

**核心实体：**

| 字段 | 类型 | 说明 |
|------|------|------|
| bot_id | string | Bot唯一标识 |
| name | string | Bot名称 |
| role | string | Bot角色描述 |
| prompt | string | System Prompt |
| tools | list | 工具列表 |
| model | string | 使用的模型 |

**核心接口：**

```
POST /api/bots          # 创建Bot
GET  /api/bots          # 获取Bot列表
GET  /api/bots/{id}     # 获取Bot详情
PUT  /api/bots/{id}     # 更新Bot
DELETE /api/bots/{id}   # 删除Bot
```

### 3.2 流程编排模块

**功能：** 设计和管理Bot协作流程

**流程类型：**

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| sequential | 链式传递 | 简单流程 |
| parallel | 并行执行 | 独立任务 |
| conditional | 条件分支 | 复杂决策 |
| group_chat | 群聊讨论 | 多角度分析 |

**核心接口：**

```
POST /api/workflows          # 创建流程
GET  /api/workflows          # 获取流程列表
GET  /api/workflows/{id}     # 获取流程详情
PUT  /api/workflows/{id}     # 更新流程
POST /api/workflows/{id}/run # 执行流程
```

### 3.3 对话模块

**功能：** 管理用户与Bot的交互

**核心接口：**

```
POST /api/chat              # 发送消息
GET  /api/chat/{session_id} # 获取会话历史
POST /api/chat/{session_id}/interrupt # 中断对话
```

### 3.4 记忆模块

**功能：** 管理对话历史和知识库

| 类型 | 说明 | 存储 |
|------|------|------|
|短期记忆 | 会话上下文 | 内存 |
|长期记忆 | 知识库 | Redis/DB |

---

## 四、数据模型

### 4.1 核心表结构

**bots表：**
```sql
CREATE TABLE bots (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role TEXT,
    prompt TEXT,
    tools JSON,
    model VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**workflows表：**
```sql
CREATE TABLE workflows (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20),  -- sequential, parallel, conditional, group_chat
    nodes JSON NOT NULL,  -- 节点定义
    edges JSON NOT NULL,  -- 边定义
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**executions表：**
```sql
CREATE TABLE executions (
    id VARCHAR(36) PRIMARY KEY,
    workflow_id VARCHAR(36),
    status VARCHAR(20),  -- running, completed, failed, interrupted
    state JSON,  -- 执行状态
    result TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);
```

---

## 五、技术选型

### 5.1 技术栈

| 层级 | 技术 | 理由 |
|------|------|------|
| 后端 | FastAPI | 高性能、易上手 |
| 编排 | LangGraph | 持久化、状态管理强 |
| 数据库 | SQLite/PostgreSQL | 结构化数据 |
| 缓存 | Redis | 会话缓存 |
| 前端 | Vue3 + NaiveUI | 组件丰富 |
| 部署 | Docker | 容器化部署 |

### 5.2 依赖清单

```
langgraph>=0.2.0      # 多Agent编排
langchain>=0.3.0      # LLM工具链
fastapi>=0.110.0      # Web框架
uvicorn>=0.27.0      # ASGI服务器
sqlalchemy>=2.0.0     # ORM
pydantic>=2.6.0      # 数据验证
redis>=5.0.0         # 缓存
python-dotenv>=1.0.0 # 环境变量
```

---

## 六、API设计

### 6.1 整体API结构

```
/api
├── /bots              # Bot管理
│   ├── POST /
│   ├── GET /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── DELETE /{id}
├── /workflows         # 流程管理
│   ├── POST /
│   ├── GET /
│   ├── GET /{id}
│   ├── PUT /{id}
│   └── POST /{id}/run
├── /chat             # 对话交互
│   ├── POST /
│   └── GET /{session_id}
└── /templates         # 模板管理
    ├── GET /
    └── POST /
```

### 6.2 请求/响应示例

**创建Bot：**
```json
// POST /api/bots
{
    "name": "选品Bot",
    "role": "跨境电商选品专家",
    "prompt": "你是一个专业的跨境电商选品专家...",
    "tools": ["search_market_data"],
    "model": "gpt-4o"
}

// Response
{
    "id": "bot_xxx",
    "name": "选品Bot",
    ...
}
```

**执行流程：**
```json
// POST /api/workflows/{id}/run
{
    "input": "帮我分析无线蓝牙耳机市场"
}

// Response (流式)
{
    "status": "running",
    "stream_url": "/api/executions/{exec_id}/stream"
}
```

---

## 七、部署方案

### 7.1 Docker部署

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: ./api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///mutkjbot.db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

### 7.2 环境变量

```env
# .env
DATABASE_URL=sqlite:///mutkjbot.db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-xxx
JWT_SECRET=your-secret-key
```

---

## 八、安全设计

### 8.1 认证授权

- API Key认证（开发环境）
- JWT Token认证（生产环境）
- 角色权限控制（Admin/User）

### 8.2 数据安全

- 敏感数据加密存储
- API请求限流
- 输入内容过滤

---

## 九、后续迭代

### 9.1 第一阶段（MVP）

- [x] Bot创建与配置
- [x] 链式流程编排
- [x] 基础对话功能
- [ ] Web界面

### 9.2 第二阶段

- [ ] 群聊模式支持
- [ ] 飞书集成
- [ ] 可视化流程编排

### 9.3 第三阶段

- [ ] 知识库功能
- [ ] 高级分析
- [ ] 多租户支持

---

*文档版本：v1.0*
*最后更新：2026-03-14*
