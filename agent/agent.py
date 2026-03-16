"""
Agent 核心类
管理 Bot 的人格设定(soul.md)和长期记忆(memory.md)
"""

import os
from pathlib import Path
from typing import Optional, Any, Dict
import json
from datetime import datetime


class Workspace:
    """工作空间管理"""
    
    def __init__(self, base_path: str):
        self.path = Path(base_path)
        self.path.mkdir(parents=True, exist_ok=True)
    
    def read(self, filename: str) -> str:
        """读取文件内容"""
        file_path = self.path / filename
        if file_path.exists():
            return file_path.read_text(encoding='utf-8')
        return ""
    
    def write(self, filename: str, content: str):
        """写入文件内容"""
        file_path = self.path / filename
        file_path.write_text(content, encoding='utf-8')
    
    def exists(self, filename: str) -> bool:
        """检查文件是否存在"""
        return (self.path / filename).exists()
    
    def list_files(self) -> list[str]:
        """列出所有文件"""
        return [f.name for f in self.path.iterdir() if f.is_file()]


class Memory:
    """长期记忆管理"""
    
    def __init__(self, memory_file: Path):
        self.file = memory_file
        self.data: Dict[str, Any] = {}
        self._load()
    
    def _load(self):
        """从文件加载记忆"""
        if self.file.exists():
            try:
                content = self.file.read_text(encoding='utf-8')
                # 尝试解析JSON格式
                self.data = json.loads(content)
            except json.JSONDecodeError:
                # 兼容旧版markdown格式
                self.data = {"_legacy": content}
    
    def _save(self):
        """保存记忆到文件"""
        content = json.dumps(self.data, ensure_ascii=False, indent=2)
        self.file.parent.mkdir(parents=True, exist_ok=True)
        self.file.write_text(content, encoding='utf-8')
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取记忆"""
        return self.data.get(key, default)
    
    def set(self, key: str, value: Any):
        """设置记忆"""
        self.data[key] = {
            "value": value,
            "updated_at": datetime.now().isoformat()
        }
        self._save()
    
    def append(self, key: str, value: Any):
        """追加记忆（列表用）"""
        if key not in self.data:
            self.data[key] = {"value": [], "updated_at": datetime.now().isoformat()}
        if isinstance(self.data[key]["value"], list):
            self.data[key]["value"].append(value)
            self.data[key]["updated_at"] = datetime.now().isoformat()
            self._save()
    
    def all(self) -> Dict[str, Any]:
        """获取所有记忆"""
        return {k: v["value"] if isinstance(v, dict) and "value" in v else v 
                for k, v in self.data.items()}
    
    def clear(self):
        """清空记忆"""
        self.data = {}
        self._save()


class Soul:
    """人格设定管理"""
    
    def __init__(self, soul_file: Path):
        self.file = soul_file
        self.content = ""
        self._load()
    
    def _load(self):
        """加载人格设定"""
        if self.file.exists():
            self.content = self.file.read_text(encoding='utf-8')
    
    def reload(self):
        """重新加载"""
        self._load()
    
    def get_prompt(self) -> str:
        """获取人格提示词"""
        return self.content
    
    def update(self, content: str):
        """更新人格设定"""
        self.file.parent.mkdir(parents=True, exist_ok=True)
        self.file.write_text(content, encoding='utf-8')
        self.content = content


class Agent:
    """
    Agent 实体类
    每个 Bot 拥有独立的人格(soul)和记忆(memory)
    """
    
    def __init__(
        self, 
        agent_id: str, 
        workspace_root: str = "./workspace"
    ):
        self.agent_id = agent_id
        self.workspace_root = Path(workspace_root)
        
        # 创建工作空间
        self.workspace = Workspace(self.workspace_root / agent_id)
        
        # 加载人格和记忆
        self.soul = Soul(self.workspace.path / "soul.md")
        self.memory = Memory(self.workspace.path / "memory.json")
        
        # 元数据
        self.created_at = self._get_meta("created_at")
        self.updated_at = self._get_meta("updated_at")
        
        # 首次创建时设置创建时间
        if not self.created_at:
            self._set_meta("created_at", datetime.now().isoformat())
    
    def _get_meta(self, key: str) -> Optional[str]:
        """获取元数据"""
        meta_file = self.workspace.path / "meta.json"
        if meta_file.exists():
            try:
                meta = json.loads(meta_file.read_text(encoding='utf-8'))
                return meta.get(key)
            except:
                pass
        return None
    
    def _set_meta(self, key: str, value: str):
        """设置元数据"""
        meta_file = self.workspace.path / "meta.json"
        meta = {}
        if meta_file.exists():
            try:
                meta = json.loads(meta_file.read_text(encoding='utf-8'))
            except:
                pass
        meta[key] = value
        meta["updated_at"] = datetime.now().isoformat()
        meta_file.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')
    
    def get_system_prompt(self) -> str:
        """获取系统提示词（人格 + 记忆）"""
        parts = []
        
        # 添加人格设定
        if self.soul.content:
            parts.append(f"## 你的角色\n{self.soul.content}")
        
        # 添加记忆
        memory_data = self.memory.all()
        if memory_data:
            parts.append("## 历史经验\n")
            for key, value in memory_data.items():
                if key == "_legacy":
                    continue
                parts.append(f"- {key}: {value}")
        
        return "\n\n".join(parts)
    
    def remember(self, key: str, value: Any):
        """记住信息"""
        self.memory.set(key, value)
        self._set_meta("updated_at", datetime.now().isoformat())
    
    def recall(self, key: str, default: Any = None) -> Any:
        """回忆信息"""
        return self.memory.get(key, default)
    
    def init_soul(self, content: str):
        """初始化人格"""
        self.soul.update(content)
    
    def get_history(self, limit: int = 10) -> list:
        """获取历史交互记录"""
        history = self.memory.get("interaction_history", [])
        return history[-limit:] if isinstance(history, list) else []


# ========== 工厂函数 ==========

_agents: Dict[str, Agent] = {}


def get_agent(agent_id: str, workspace_root: str = "./workspace") -> Agent:
    """获取或创建 Agent"""
    if agent_id not in _agents:
        _agents[agent_id] = Agent(agent_id, workspace_root)
    return _agents[agent_id]


def list_agents(workspace_root: str = "./workspace") -> list[str]:
    """列出所有 Agent"""
    root = Path(workspace_root)
    if not root.exists():
        return []
    return [d.name for d in root.iterdir() if d.is_dir()]
