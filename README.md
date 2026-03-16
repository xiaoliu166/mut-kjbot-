# mut-kjbot

跨境多Agent协作平台

## 项目简介

通用多Agent协作平台，支持多个AI Bot自动对话、分工协作。

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 启动API服务
python api/server.py

# 启动前端管理后台
cd admin && npm install && npm run dev
```

## 功能迭代

### v1.0: 核心功能 ✅
- Agent持久化、触发器系统、协作消息总线

### v2.0: 企业级功能 ✅
- Skills动态扩展、企业级RBAC、渠道集成

### v2.1: 运维功能 ✅
- Web管理后台API、数据分析报表、多模型支持

### v2.2: 扩展功能 ✅
- 更多AI模型支持（9家）、Vue 3管理界面

## 代码结构

```
mut-kjbot/
├── agent/              # Agent核心
├── trigger/            # 触发器
├── message/            # 消息协作
├── skills/             # Skills
├── rbac/               # RBAC
├── channels/           # 渠道
├── models/             # 多模型(9家)
├── api/                # FastAPI后端
├── admin/              # Vue 3前端
│   ├── src/views/      # 页面组件
│   └── ...
└── workspace/          # 数据目录
```

## AI模型支持

| 提供商 | 模型 | 状态 |
|--------|------|------|
| OpenAI | GPT-4/3.5 | ✅ |
| DeepSeek | Chat/Coder | ✅ |
| Claude | Opus/Sonnet/Haiku | ⚠️ |
| Gemini | Pro | ⚠️ |
| 通义千问 | Turbo/Max | ✅ |
| 智谱AI | GLM-4 | ⚠️ |
| MiniMax | Abab | ✅ |
| 文心一言 | Ernie | ⚠️ |
| Ollama | Llama2 | ⚠️ |

## 管理后台页面

- 仪表盘 - 统计概览
- Bot管理 - CRUD
- Skills商店 - 安装/卸载
- 触发器 - 任务调度
- 渠道集成 - 飞书/Slack
- 模型配置 - 切换模型
- 数据报表 - 统计分析
- 用户权限 - RBAC

## 文档

- v1.0: https://feishu.cn/docx/Bx4ldjNQsobviIxnsoQcb9MLn4H
- v2.0: https://feishu.cn/docx/EGmzdFC2hozlcsxlafrcbm6Ynsc
- v2.1: https://feishu.cn/docx/D3SQdDScFos8g6x3DbscZKalnMg
- v2.2: https://feishu.cn/docx/W8gYd4zNwoacssxoByBcSZx7nEf
