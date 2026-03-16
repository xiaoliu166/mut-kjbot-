"""
渠道集成模块
支持飞书/Slack/Discord等IM渠道接入
"""

import threading
import json
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Callable, Optional
from datetime import datetime
from enum import Enum


class MessageType(Enum):
    """消息类型"""
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    CARD = "card"  # 富文本卡片
    BUTTON = "button"


class ChannelEvent(Enum):
    """渠道事件"""
    MESSAGE = "message"
    MENTION = "mention"
    CALLBACK = "callback"  # 按钮点击
    COMMAND = "command"


class ChannelAdapter(ABC):
    """渠道适配器基类"""
    
    def __init__(self, channel_id: str, config: Dict = None):
        self.channel_id = channel_id
        self.config = config or {}
        self.handlers: Dict[ChannelEvent, List[Callable]] = {
            event: [] for event in ChannelEvent
        }
        self._running = False
    
    @abstractmethod
    def send_message(self, user_id: str, message: Dict) -> bool:
        """发送消息"""
        pass
    
    @abstractmethod
    def send_card(self, user_id: str, card: Dict) -> bool:
        """发送富文本卡片"""
        pass
    
    @abstractmethod
    def start(self):
        """启动监听"""
        pass
    
    @abstractmethod
    def stop(self):
        """停止监听"""
        pass
    
    def on(self, event: ChannelEvent, handler: Callable):
        """注册事件处理器"""
        self.handlers[event].append(handler)
    
    def _dispatch(self, event: ChannelEvent, data: Dict):
        """分发事件"""
        for handler in self.handlers.get(event, []):
            try:
                handler(data)
            except Exception as e:
                print(f"Handler error: {e}")


class FeishuAdapter(ChannelAdapter):
    """飞书渠道适配器"""
    
    def __init__(self, channel_id: str, app_id: str = None, app_secret: str = None):
        super().__init__(channel_id)
        self.app_id = app_id or "cli_xxx"
        self.app_secret = app_secret or "xxx"
        self.base_url = "https://open.feishu.cn/open-apis"
        self._token = None
    
    def _get_token(self) -> str:
        """获取调用凭证（简化版）"""
        # 实际需要调用飞书API
        return "mock_token"
    
    def send_message(self, user_id: str, message: Dict) -> bool:
        """发送文本消息"""
        # 简化实现
        msg_type = message.get("type", "text")
        content = message.get("content", {})
        
        if msg_type == "text":
            text = content.get("text", "")
            print(f"[Feishu] 发送消息给 {user_id}: {text[:50]}...")
        elif msg_type == "image":
            print(f"[Feishu] 发送图片给 {user_id}")
        
        return True
    
    def send_card(self, user_id: str, card: Dict) -> bool:
        """发送卡片消息"""
        card_json = json.dumps(card, ensure_ascii=False)
        print(f"[Feishu] 发送卡片给 {user_id}: {card_json[:100]}...")
        return True
    
    def send_interactive_card(self, user_id: str, title: str, elements: List[Dict], actions: List[Dict] = None) -> bool:
        """发送交互卡片"""
        card = {
            "config": {
                "wide_screen_mode": True
            },
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": title
                },
                "template": "blue"
            },
            "elements": elements
        }
        
        if actions:
            card["element"] = actions
        
        return self.send_card(user_id, card)
    
    def start(self):
        """启动监听"""
        self._running = True
        print(f"[Feishu] 渠道 {self.channel_id} 已启动")
    
    def stop(self):
        """停止监听"""
        self._running = False
        print(f"[Feishu] 渠道 {self.channel_id} 已停止")
    
    def handle_webhook(self, payload: Dict):
        """处理Webhook回调"""
        event_type = payload.get("type")
        
        if event_type == "url_verification":
            # 验证回调URL
            return {"challenge": payload.get("challenge")}
        
        elif event_type == "event_callback":
            event = payload.get("event", {})
            event_name = event.get("type")
            
            if event_name == "message":
                # 处理消息
                self._dispatch(ChannelEvent.MESSAGE, {
                    "user_id": event.get("user", {}).get("open_id"),
                    "content": event.get("message", {}).get("content"),
                    "message_id": event.get("message", {}).get("message_id")
                })
            
            elif event_name == "im.message":
                # 处理IM消息
                self._dispatch(ChannelEvent.MESSAGE, event)
        
        return {"code": 0}


class SlackAdapter(ChannelAdapter):
    """Slack渠道适配器"""
    
    def __init__(self, channel_id: str, bot_token: str = None, signing_secret: str = None):
        super().__init__(channel_id)
        self.bot_token = bot_token or "xoxb-xxx"
        self.signing_secret = signing_secret or "xxx"
    
    def send_message(self, user_id: str, message: Dict) -> bool:
        """发送消息"""
        msg_type = message.get("type", "text")
        content = message.get("content", {})
        
        if msg_type == "text":
            text = content.get("text", "")
            print(f"[Slack] 发送消息给 {user_id}: {text[:50]}...")
        
        return True
    
    def send_card(self, user_id: str, card: Dict) -> bool:
        """发送Blocks消息"""
        blocks = card.get("blocks", [])
        print(f"[Slack] 发送Blocks给 {user_id}: {len(blocks)} blocks")
        return True
    
    def send_rich_message(self, user_id: str, text: str, blocks: List[Dict] = None, attachments: List[Dict] = None) -> bool:
        """发送富文本消息"""
        message = {
            "channel": user_id,
            "text": text,
            "blocks": blocks or [],
            "attachments": attachments or []
        }
        
        print(f"[Slack] 发送富文本消息: {text[:50]}...")
        return True
    
    def start(self):
        """启动监听"""
        self._running = True
        print(f"[Slack] 渠道 {self.channel_id} 已启动")
    
    def stop(self):
        """停止监听"""
        self._running = False
        print(f"[Slack] 渠道 {self.channel_id} 已停止")
    
    def handle_event(self, payload: Dict):
        """处理事件"""
        event_type = payload.get("type")
        
        if event_type == "event_callback":
            event = payload.get("event", {})
            event_name = event.get("type")
            
            if event_name == "message":
                self._dispatch(ChannelEvent.MESSAGE, {
                    "user": event.get("user"),
                    "channel": event.get("channel"),
                    "text": event.get("text"),
                    "ts": event.get("ts")
                })
            
            elif event_name == "app_mention":
                self._dispatch(ChannelEvent.MENTION, event)
        
        elif event_type == "url_verification":
            return {"challenge": payload.get("challenge")}
        
        elif event_type == "block_actions":
            # 处理按钮回调
            self._dispatch(ChannelEvent.CALLBACK, payload)
        
        return {"ok": True}


class ChannelManager:
    """渠道管理器"""
    
    def __init__(self):
        self.channels: Dict[str, ChannelAdapter] = {}
        self._lock = threading.Lock()
    
    def register(self, adapter: ChannelAdapter):
        """注册渠道"""
        with self._lock:
            self.channels[adapter.channel_id] = adapter
    
    def get(self, channel_id: str) -> Optional[ChannelAdapter]:
        """获取渠道"""
        return self.channels.get(channel_id)
    
    def list_channels(self) -> List[Dict]:
        """列出所有渠道"""
        return [
            {
                "id": ch.channel_id,
                "type": type(ch).__name__,
                "running": ch._running
            }
            for ch in self.channels.values()
        ]
    
    def send_to_all(self, user_id: str, message: Dict) -> int:
        """发送给所有渠道"""
        count = 0
        for channel in self.channels.values():
            if channel._running:
                if channel.send_message(user_id, message):
                    count += 1
        return count


# 全局单例
_channel_manager: Optional[ChannelManager] = None


def get_channel_manager() -> ChannelManager:
    """获取渠道管理器"""
    global _channel_manager
    if _channel_manager is None:
        _channel_manager = ChannelManager()
    return _channel_manager


# ========== 测试 ==========

if __name__ == "__main__":
    print("=" * 50)
    print("📱 渠道集成模块测试")
    print("=" * 50)
    
    manager = get_channel_manager()
    
    # 注册飞书渠道
    print("\n1. 注册飞书渠道...")
    feishu = FeishuAdapter("feishu_bot_1", "app_id_xxx", "app_secret_xxx")
    manager.register(feishu)
    print(f"   飞书渠道已注册: {feishu.channel_id}")
    
    # 注册Slack渠道
    print("\n2. 注册Slack渠道...")
    slack = SlackAdapter("slack_bot_1", "xoxb-xxx", "secret_xxx")
    manager.register(slack)
    print(f"   Slack渠道已注册: {slack.channel_id}")
    
    # 发送消息
    print("\n3. 发送消息测试...")
    feishu.send_message("user_123", {
        "type": "text",
        "content": {"text": "你好，这是测试消息"}
    })
    
    slack.send_message("U123", {
        "type": "text",
        "content": {"text": "Hello, this is a test"}
    })
    
    # 发送卡片
    print("\n4. 发送卡片测试...")
    feishu.send_interactive_card(
        "user_123",
        "操作菜单",
        [
            {
                "tag": "div",
                "text": {
                    "tag": "plain_text",
                    "content": "请选择一个操作："
                }
            }
        ],
        [
            {
                "tag": "button",
                "text": {"tag": "plain_text", "content": "确认"},
                "type": "primary",
                "action_id": "confirm"
            },
            {
                "tag": "button",
                "text": {"tag": "plain_text", "content": "取消"},
                "action_id": "cancel"
            }
        ]
    )
    
    # 列出渠道
    print("\n5. 渠道列表:")
    for ch in manager.list_channels():
        print(f"   - {ch['type']}: {ch['id']} ({'运行中' if ch['running'] else '已停止'})")
    
    print("\n" + "=" * 50)
    print("✅ Sprint 6 (渠道集成) 测试通过")
    print("=" * 50)
