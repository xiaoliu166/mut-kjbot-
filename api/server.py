"""
mut-kjbot Web管理后台 API
基于FastAPI构建
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from enum import Enum

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


# ========== 配置 ==========
app = FastAPI(title="mut-kjbot API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== 数据模型 ==========

class BotInfo(BaseModel):
    id: str
    name: str
    status: str
    soul: str = ""
    memory_count: int = 0


class SkillInfo(BaseModel):
    id: str
    name: str
    version: str
    source: str
    installed_at: str


class TriggerInfo(BaseModel):
    id: str
    type: str
    agent_id: str
    status: str
    next_fire: str


class MessageStats(BaseModel):
    total: int
    delegates: int
    notifications: int
    broadcasts: int


class DashboardStats(BaseModel):
    bots_count: int
    skills_count: int
    triggers_count: int
    messages_today: int
    messages_total: int
    active_agents: int


class ModelConfig(BaseModel):
    provider: str
    model: str
    api_key: str
    base_url: Optional[str] = None


# ========== 模拟数据 ==========
def get_workspace_root():
    return "./workspace"


# ========== API路由 ==========

@app.get("/")
async def root():
    return {"message": "mut-kjbot API v2.1.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# ========== Bot管理 ==========

@app.get("/api/bots", response_model=List[BotInfo])
async def list_bots():
    """列出所有Bot"""
    from agent.agent import list_agents
    
    bots = []
    for agent_id in list_agents(get_workspace_root()):
        from agent.agent import get_agent
        agent = get_agent(agent_id, get_workspace_root())
        
        bots.append(BotInfo(
            id=agent_id,
            name=agent_id,
            status="active",
            soul=agent.soul.content[:100] if agent.soul.content else "",
            memory_count=len(agent.memory.all())
        ))
    
    return bots


@app.get("/api/bots/{bot_id}")
async def get_bot(bot_id: str):
    """获取Bot详情"""
    from agent.agent import get_agent
    
    try:
        agent = get_agent(bot_id, get_workspace_root())
        
        return {
            "id": agent.agent_id,
            "name": agent.agent_id,
            "soul": agent.soul.content,
            "memory": agent.memory.all(),
            "history": agent.get_history()
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.put("/api/bots/{bot_id}/soul")
async def update_bot_soul(bot_id: str, content: str):
    """更新Bot人格"""
    from agent.agent import get_agent
    
    agent = get_agent(bot_id, get_workspace_root())
    agent.soul.update(content)
    
    return {"status": "success", "bot_id": bot_id}


# ========== Skills管理 ==========

@app.get("/api/skills", response_model=List[SkillInfo])
async def list_skills():
    """列出所有Skills"""
    from skills.manager import get_skill_manager
    
    manager = get_skill_manager("./skills/store")
    skills = manager.list()
    
    return [
        SkillInfo(
            id=s.manifest.id,
            name=s.manifest.name,
            version=s.manifest.version,
            source=s.source,
            installed_at=s.installed_at
        )
        for s in skills
    ]


@app.post("/api/skills/{skill_id}/install")
async def install_skill(skill_id: str):
    """安装Skill"""
    from skills.manager import get_skill_manager
    
    manager = get_skill_manager("./skills/store")
    success = manager.install_local(skill_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Skill not found")
    
    return {"status": "success", "skill_id": skill_id}


@app.delete("/api/skills/{skill_id}")
async def uninstall_skill(skill_id: str):
    """卸载Skill"""
    from skills.manager import get_skill_manager
    
    manager = get_skill_manager("./skills/store")
    success = manager.uninstall(skill_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    return {"status": "success", "skill_id": skill_id}


# ========== 触发器管理 ==========

@app.get("/api/triggers", response_model=List[TriggerInfo])
async def list_triggers():
    """列出所有触发器"""
    # 简化实现：返回示例数据
    return [
        TriggerInfo(
            id="t1",
            type="interval",
            agent_id="selectors",
            status="running",
            next_fire="2026-03-16 18:00:00"
        )
    ]


# ========== 消息统计 ==========

@app.get("/api/messages/stats", response_model=MessageStats)
async def get_message_stats():
    """获取消息统计"""
    from message.bus import AgentMessageBus
    
    feed = AgentMessageBus.get_feed()
    
    total = sum(len(msgs) for msgs in feed.values())
    
    return MessageStats(
        total=total,
        delegates=total // 3,
        notifications=total // 3,
        broadcasts=total // 3
    )


# ========== 仪表盘 ==========

@app.get("/api/dashboard", response_model=DashboardStats)
async def get_dashboard():
    """获取仪表盘数据"""
    from agent.agent import list_agents
    from skills.manager import get_skill_manager
    from message.bus import AgentMessageBus
    
    bots = list_agents(get_workspace_root())
    manager = get_skill_manager("./skills/store")
    skills = manager.list()
    feed = AgentMessageBus.get_feed()
    
    messages_total = sum(len(msgs) for msgs in feed.values())
    
    return DashboardStats(
        bots_count=len(bots),
        skills_count=len(skills),
        triggers_count=1,  # 简化
        messages_today=messages_total,
        messages_total=messages_total,
        active_agents=len(bots)
    )


# ========== RBAC ==========

@app.get("/api/tenants")
async def list_tenants():
    """列出租户"""
    from rbac.rbac import get_rbac
    
    rbac = get_rbac()
    tenants = rbac.list_tenants()
    
    return [t.to_dict() for t in tenants]


@app.get("/api/users")
async def list_users(tenant_id: str = None):
    """列出用户"""
    from rbac.rbac import get_rbac
    
    rbac = get_rbac()
    
    if tenant_id:
        users = rbac.list_users(tenant_id)
    else:
        users = list(rbac.users.values())
    
    return [u.to_dict() for u in users]


# ========== 渠道 ==========

@app.get("/api/channels")
async def list_channels():
    """列出渠道"""
    from channels.adapter import get_channel_manager
    
    manager = get_channel_manager()
    return manager.list_channels()


# ========== 模型配置 ==========

@app.get("/api/models")
async def list_models():
    """列出可用模型"""
    return [
        {"provider": "openai", "model": "gpt-4o", "name": "OpenAI GPT-4"},
        {"provider": "openai", "model": "gpt-3.5-turbo", "name": "OpenAI GPT-3.5"},
        {"provider": "deepseek", "model": "deepseek-chat", "name": "DeepSeek Chat"},
        {"provider": "anthropic", "model": "claude-3-opus", "name": "Claude 3 Opus"},
        {"provider": "ollama", "model": "llama2", "name": "Ollama Llama2"},
    ]


@app.get("/api/models/current")
async def get_current_model():
    """获取当前模型"""
    # 简化实现
    return {"provider": "openai", "model": "gpt-4o"}


@app.post("/api/models/current")
async def set_current_model(config: ModelConfig):
    """设置当前模型"""
    # 保存配置到文件
    config_file = Path("./workspace/model_config.json")
    config_file.parent.mkdir(parents=True, exist_ok=True)
    config_file.write_text(
        json.dumps(config.dict(), ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    
    return {"status": "success", "config": config.dict()}


# ========== 报表 ==========

@app.get("/api/reports/usage")
async def get_usage_report():
    """获取使用报表"""
    from agent.agent import list_agents
    from message.bus import AgentMessageBus
    
    bots = list_agents(get_workspace_root())
    feed = AgentMessageBus.get_feed()
    
    # 按Bot统计
    bot_stats = []
    for bot_id in bots:
        agent_msg_count = len(feed.get(bot_id, []))
        bot_stats.append({
            "bot_id": bot_id,
            "messages": agent_msg_count,
            "status": "active"
        })
    
    return {
        "period": "2026-03",
        "total_bots": len(bots),
        "total_messages": sum(len(msgs) for msgs in feed.values()),
        "bot_stats": bot_stats
    }


@app.get("/api/reports/activity")
async def get_activity_report():
    """获取活跃度报表"""
    return {
        "daily_active": 10,
        "weekly_active": 25,
        "monthly_active": 50,
        "avg_response_time_ms": 1500
    }


# ========== 启动 ==========

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 50)
    print("🚀 mut-kjbot API Server")
    print("=" * 50)
    print("API文档: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
