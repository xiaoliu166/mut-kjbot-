"""
Agent 协作消息模块
支持Bot之间发送消息、委派任务、协作Feed记录
"""

import json
import threading
import time
from typing import Callable, Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path
from enum import Enum

from trigger.engine import MessageBus as BaseMessageBus


class MessageType(Enum):
    """消息类型"""
    TASK = "task"           # 任务委派
    NOTIFICATION = "notify" # 通知
    REQUEST = "request"     # 请求
    RESPONSE = "response"  # 响应
    BROADCAST = "broadcast" # 广播


class MessagePriority(Enum):
    """消息优先级"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4


class Message:
    """Agent消息"""
    
    def __init__(
        self,
        msg_id: str,
        from_agent: str,
        to_agent: str,
        msg_type: MessageType,
        content: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL,
        correlation_id: str = None
    ):
        self.id = msg_id
        self.from_agent = from_agent
        self.to_agent = to_agent
        self.type = msg_type
        self.content = content
        self.priority = priority
        self.correlation_id = correlation_id or msg_id
        self.timestamp = datetime.now().isoformat()
        self.status = "pending"  # pending, delivered, read, processed
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "from": self.from_agent,
            "to": self.to_agent,
            "type": self.type.value,
            "content": self.content,
            "priority": self.priority.value,
            "correlation_id": self.correlation_id,
            "timestamp": self.timestamp,
            "status": self.status
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Message":
        msg = cls(
            msg_id=data["id"],
            from_agent=data["from"],
            to_agent=data["to"],
            msg_type=MessageType(data["type"]),
            content=data["content"],
            priority=MessagePriority(data.get("priority", 2)),
            correlation_id=data.get("correlation_id")
        )
        msg.timestamp = data.get("timestamp", datetime.now().isoformat())
        msg.status = data.get("status", "pending")
        return msg


class CollaborationFeed:
    """协作Feed - 记录所有Bot之间的协作历史"""
    
    def __init__(self, storage_path: str = "./workspace/feed"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
    
    def _get_feed_file(self, agent_id: str) -> Path:
        return self.storage_path / f"{agent_id}_feed.json"
    
    def add(self, message: Message):
        """添加协作记录"""
        with self._lock:
            feed_file = self._get_feed_file(message.to_agent)
            messages = self._load(feed_file)
            messages.append(message.to_dict())
            # 只保留最近100条
            messages = messages[-100:]
            self._save(feed_file, messages)
    
    def _load(self, file_path: Path) -> List[Dict]:
        if file_path.exists():
            try:
                return json.loads(file_path.read_text(encoding='utf-8'))
            except:
                return []
        return []
    
    def _save(self, file_path: Path, messages: List[Dict]):
        file_path.write_text(
            json.dumps(messages, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
    
    def get_feed(self, agent_id: str, limit: int = 20) -> List[Dict]:
        """获取协作Feed"""
        feed_file = self._get_feed_file(agent_id)
        messages = self._load(feed_file)
        return messages[-limit:]
    
    def get_all_feeds(self, limit: int = 20) -> Dict[str, List[Dict]]:
        """获取所有Bot的协作Feed"""
        feeds = {}
        for file in self.storage_path.glob("*_feed.json"):
            agent_id = file.stem.replace("_feed", "")
            feeds[agent_id] = self.get_feed(agent_id, limit)
        return feeds
    
    def clear(self, agent_id: str = None):
        """清空Feed"""
        with self._lock:
            if agent_id:
                feed_file = self._get_feed_file(agent_id)
                if feed_file.exists():
                    feed_file.unlink()
            else:
                for file in self.storage_path.glob("*_feed.json"):
                    file.unlink()


# 全局协作Feed实例
_collaboration_feed = CollaborationFeed()


class AgentMessageBus(BaseMessageBus):
    """Agent消息总线 - 扩展自触发器引擎的MessageBus"""
    
    _handlers: Dict[str, List[Callable]] = {}
    _feed: CollaborationFeed = _collaboration_feed
    _lock = threading.Lock()
    _message_counter = 0
    
    @classmethod
    def _generate_id(cls) -> str:
        """生成消息ID"""
        cls._message_counter += 1
        return f"msg_{int(time.time()*1000)}_{cls._message_counter}"
    
    @classmethod
    def send_message(
        cls,
        from_agent: str,
        to_agent: str,
        msg_type: MessageType,
        content: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL
    ) -> Message:
        """发送消息（带协作Feed记录）"""
        msg = Message(
            msg_id=cls._generate_id(),
            from_agent=from_agent,
            to_agent=to_agent,
            msg_type=msg_type,
            content=content,
            priority=priority
        )
        
        # 记录到Feed
        cls._feed.add(msg)
        
        # 投递消息
        cls.send(from_agent, to_agent, msg.to_dict())
        
        return msg
    
    @classmethod
    def delegate_task(
        cls,
        from_agent: str,
        to_agent: str,
        task: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL
    ) -> Message:
        """委派任务"""
        return cls.send_message(
            from_agent,
            to_agent,
            MessageType.TASK,
            {"action": "task", "task": task},
            priority
        )
    
    @classmethod
    def notify(
        cls,
        from_agent: str,
        to_agent: str,
        notification: Dict[str, Any],
        priority: MessagePriority = MessagePriority.NORMAL
    ) -> Message:
        """发送通知"""
        return cls.send_message(
            from_agent,
            to_agent,
            MessageType.NOTIFICATION,
            {"action": "notify", "notification": notification},
            priority
        )
    
    @classmethod
    def broadcast(
        cls,
        from_agent: str,
        message: Dict[str, Any],
        msg_type: MessageType = MessageType.BROADCAST
    ) -> List[Message]:
        """广播消息给所有Agent"""
        from agent.agent import list_agents
        
        messages = []
        for agent_id in list_agents("./workspace"):
            if agent_id != from_agent:
                msg = cls.send_message(
                    from_agent,
                    agent_id,
                    msg_type,
                    message
                )
                messages.append(msg)
        
        # 记录广播到Feed
        broadcast_msg = Message(
            msg_id=cls._generate_id(),
            from_agent=from_agent,
            to_agent="all",
            msg_type=msg_type,
            content=message
        )
        cls._feed.add(broadcast_msg)
        
        return messages
    
    @classmethod
    def get_feed(cls, agent_id: str = None, limit: int = 20) -> Dict[str, List[Dict]]:
        """获取协作Feed"""
        if agent_id:
            return {agent_id: cls._feed.get_feed(agent_id, limit)}
        return cls._feed.get_all_feeds(limit)
    
    @classmethod
    def register_handler(cls, agent_id: str, handler: Callable):
        """注册消息处理器"""
        with cls._lock:
            if agent_id not in cls._handlers:
                cls._handlers[agent_id] = []
            cls._handlers[agent_id].append(handler)
            # 同时注册到底层MessageBus
            cls.subscribe(agent_id, handler)
    
    @classmethod
    def unregister_handler(cls, agent_id: str, handler: Callable):
        """注销消息处理器"""
        with cls._lock:
            if agent_id in cls._handlers:
                cls._handlers[agent_id].remove(handler)
            cls.unsubscribe(agent_id, handler)


# ========== 与LangGraph集成的协作节点 ==========

def create_collab_node(agent_id: str):
    """创建协作节点 - 在LangGraph中使用"""
    
    def collab_node(state: Dict) -> Dict:
        """协作节点"""
        # 获取消息
        messages = state.get("messages", [])
        
        # 注册消息处理
        def handler(from_agent: str, msg: Dict):
            print(f"  [{agent_id}] 收到来自 {from_agent} 的消息: {msg.get('type')}")
            # 可以更新state
        
        AgentMessageBus.register_handler(agent_id, handler)
        
        return state
    
    return collab_node


def create_delegation_edge(from_node: str, to_node: str):
    """创建委派边 - 任务完成后自动委派"""
    
    def delegation_edge(state: Dict) -> str:
        """判断是否需要委派"""
        if state.get("delegate_next", False):
            # 委派给下一个Bot
            return to_node
        return "__end__"
    
    return delegation_edge


# ========== 示例流程 ==========

def demo_collaboration():
    """演示Agent协作"""
    from agent.agent import get_agent
    
    print("\n" + "=" * 50)
    print("💬 Agent 协作演示")
    print("=" * 50)
    
    # 1. 选品Bot完成分析，委派给投放Bot
    print("\n1. 选品Bot委派任务给投放Bot...")
    msg = AgentMessageBus.delegate_task(
        "selectors",
        "ads",
        {
            "product": "无线蓝牙耳机",
            "market_score": 4.5,
            "action": "create_ad_campaign"
        }
    )
    print(f"   消息ID: {msg.id}")
    
    # 2. 投放Bot发送通知给运营Bot
    print("\n2. 投放Bot通知运营Bot...")
    msg2 = AgentMessageBus.notify(
        "ads",
        "ops",
        {
            "ad_strategy": "已完成",
            "keywords": ["bluetooth earphone", "wireless headset"]
        }
    )
    print(f"   消息ID: {msg2.id}")
    
    # 3. 广播消息
    print("\n3. 广播消息...")
    msgs = AgentMessageBus.broadcast(
        "selectors",
        {"type": "system", "content": "选品分析完成"}
    )
    print(f"   广播给 {len(msgs)} 个Bot")
    
    # 4. 查看协作Feed
    print("\n4. 协作Feed记录:")
    feed = AgentMessageBus.get_feed()
    for agent_id, messages in feed.items():
        print(f"\n   【{agent_id}】收到 {len(messages)} 条消息:")
        for m in messages[-2:]:
            print(f"     - {m['type']} from {m['from']}")
    
    print("\n✅ 协作演示完成")


if __name__ == "__main__":
    demo_collaboration()
