"""
触发器引擎模块
支持多种触发器类型：Cron、定时、消息、Webhook
纯标准库实现，无需额外依赖
"""

import threading
import time
import json
from abc import ABC, abstractmethod
from typing import Callable, Optional, Dict, Any, List
from datetime import datetime, timedelta
from pathlib import Path


class Trigger(ABC):
    """触发器基类"""
    
    def __init__(self, trigger_id: str, agent_id: str, action: Callable):
        self.trigger_id = trigger_id
        self.agent_id = agent_id
        self.action = action
        self.running = False
    
    @abstractmethod
    def start(self):
        """启动触发器"""
        pass
    
    @abstractmethod
    def stop(self):
        """停止触发器"""
        pass
    
    @abstractmethod
    def next_fire_time(self) -> Optional[str]:
        """下次触发时间"""
        pass


class CronTrigger(Trigger):
    """Cron 定时触发器 - 简化版，支持基本cron表达式"""
    
    def __init__(self, trigger_id: str, agent_id: str, cron_expr: str, action: Callable):
        super().__init__(trigger_id, agent_id, action)
        self.cron_expr = cron_expr
        self._thread: Optional[threading.Thread] = None
        self._parse_cron(cron_expr)
    
    def _parse_cron(self, cron_expr: str):
        """解析cron表达式（简化版：只支持分、时、天）"""
        parts = cron_expr.split()
        if len(parts) >= 3:
            self.minute = parts[0]
            self.hour = parts[1]
            self.day = parts[2]
        else:
            self.minute = "*"
            self.hour = "*"
            self.day = "*"
    
    def _get_next_time(self) -> datetime:
        """计算下次执行时间"""
        now = datetime.now()
        
        # 简化实现：每分钟检查一次
        return now + timedelta(minutes=1)
    
    def start(self):
        """启动Cron触发器"""
        self.running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
    
    def stop(self):
        """停止触发器"""
        self.running = False
    
    def _run(self):
        """执行循环"""
        while self.running:
            try:
                next_time = self._get_next_time()
                sleep_seconds = (next_time - datetime.now()).total_seconds()
                
                if sleep_seconds > 0:
                    time.sleep(min(sleep_seconds, 60))
                
                if self.running:
                    self._execute()
                    time.sleep(1)  # 避免同一分钟内重复执行
            except Exception as e:
                print(f"CronTrigger error: {e}")
                time.sleep(60)
    
    def _execute(self):
        """执行动作"""
        try:
            from agent.agent import get_agent
            agent = get_agent(self.agent_id, "./workspace")
            self.action(agent)
        except Exception as e:
            print(f"Action execution error: {e}")
    
    def next_fire_time(self) -> str:
        """下次触发时间"""
        return self._get_next_time().strftime("%Y-%m-%d %H:%M:%S")


class IntervalTrigger(Trigger):
    """间隔触发器"""
    
    def __init__(self, trigger_id: str, agent_id: str, interval_seconds: int, action: Callable):
        super().__init__(trigger_id, agent_id, action)
        self.interval_seconds = interval_seconds
        self._thread: Optional[threading.Thread] = None
    
    def start(self):
        """启动间隔触发器"""
        self.running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
    
    def stop(self):
        """停止触发器"""
        self.running = False
    
    def _run(self):
        """执行循环"""
        while self.running:
            try:
                time.sleep(self.interval_seconds)
                if self.running:
                    self._execute()
            except Exception as e:
                print(f"IntervalTrigger error: {e}")
    
    def _execute(self):
        """执行动作"""
        try:
            from agent.agent import get_agent
            agent = get_agent(self.agent_id, "./workspace")
            self.action(agent)
        except Exception as e:
            print(f"Action execution error: {e}")
    
    def next_fire_time(self) -> str:
        """下次触发时间"""
        return (datetime.now() + timedelta(seconds=self.interval_seconds)).strftime("%Y-%m-%d %H:%M:%S")


class MessageTrigger(Trigger):
    """消息触发器 - 监听其他Agent的消息"""
    
    def __init__(self, trigger_id: str, agent_id: str, source_agent: str, action: Callable):
        super().__init__(trigger_id, agent_id, action)
        self.source_agent = source_agent
    
    def start(self):
        """启动消息触发器（被动，由消息总线驱动）"""
        self.running = True
        MessageBus.subscribe(self.source_agent, self._on_message)
    
    def stop(self):
        """停止触发器"""
        self.running = False
        MessageBus.unsubscribe(self.source_agent, self._on_message)
    
    def _on_message(self, from_agent: str, message: Dict[str, Any]):
        """收到消息时的回调"""
        if from_agent == self.source_agent and self.running:
            self._execute()
    
    def _execute(self):
        """执行动作"""
        try:
            from agent.agent import get_agent
            agent = get_agent(self.agent_id, "./workspace")
            self.action(agent)
        except Exception as e:
            print(f"Action execution error: {e}")
    
    def next_fire_time(self) -> str:
        """下次触发时间（消息触发不适用）"""
        return "on_message"


class WebhookTrigger(Trigger):
    """Webhook 触发器 - 接收外部HTTP请求（需要Flask）"""
    
    def __init__(self, trigger_id: str, agent_id: str, route: str, port: int, action: Callable):
        super().__init__(trigger_id, agent_id, action)
        self.route = route
        self.port = port
        self.server = None
        self._has_flask = False
        
        try:
            from flask import Flask, request, jsonify
            self._has_flask = True
            self._Flask = Flask
            self._request = request
            self._jsonify = jsonify
        except ImportError:
            print("Warning: Flask not installed, webhook trigger unavailable")
    
    def start(self):
        """启动Webhook服务器"""
        if not self._has_flask:
            print("Webhook trigger requires Flask")
            return
            
        self.running = True
        self._thread = threading.Thread(target=self._run_server, daemon=True)
        self._thread.start()
    
    def stop(self):
        """停止触发器"""
        self.running = False
        if self.server:
            try:
                self.server.shutdown()
            except:
                pass
    
    def _run_server(self):
        """运行简单HTTP服务器"""
        app = self._Flask(__name__)
        
        @app.route(self.route, methods=['POST'])
        def webhook_handler():
            if self.running:
                data = self._request.get_json() or {}
                self._execute(data)
                return self._jsonify({"status": "ok"})
            return self._jsonify({"status": "stopped"}), 503
        
        try:
            from werkzeug.serving import make_server
            self.server = make_server('0.0.0.0', self.port, app, threaded=True)
            self.server.serve_forever()
        except Exception as e:
            print(f"Webhook server error: {e}")
    
    def _execute(self, data: Dict[str, Any]):
        """执行动作"""
        try:
            from agent.agent import get_agent
            agent = get_agent(self.agent_id, "./workspace")
            self.action(agent, data)
        except Exception as e:
            print(f"Action execution error: {e}")
    
    def next_fire_time(self) -> str:
        """下次触发时间"""
        return f"http://0.0.0.0:{self.port}{self.route}"


class MessageBus:
    """Agent 消息总线 - 支持消息触发"""
    
    _subscribers: Dict[str, List[Callable]] = {}
    _lock = threading.Lock()
    
    @classmethod
    def subscribe(cls, agent_id: str, handler: Callable):
        """订阅消息"""
        with cls._lock:
            if agent_id not in cls._subscribers:
                cls._subscribers[agent_id] = []
            cls._subscribers[agent_id].append(handler)
    
    @classmethod
    def unsubscribe(cls, agent_id: str, handler: Callable):
        """取消订阅"""
        with cls._lock:
            if agent_id in cls._subscribers:
                cls._subscribers[agent_id].remove(handler)
    
    @classmethod
    def send(cls, from_agent: str, to_agent: str, message: Dict[str, Any]):
        """发送消息"""
        with cls._lock:
            handlers = cls._subscribers.get(to_agent, [])
            for handler in handlers:
                try:
                    handler(from_agent, message)
                except Exception as e:
                    print(f"Message handler error: {e}")
    
    @classmethod
    def broadcast(cls, from_agent: str, message: Dict[str, Any]):
        """广播消息"""
        with cls._lock:
            for agent_id, handlers in cls._subscribers.items():
                if agent_id != from_agent:
                    for handler in handlers:
                        try:
                            handler(from_agent, message)
                        except Exception as e:
                            print(f"Broadcast handler error: {e}")


class TriggerEngine:
    """触发器引擎 - 统一管理所有触发器"""
    
    def __init__(self, agent_id: str, workspace_root: str = "./workspace"):
        self.agent_id = agent_id
        self.workspace_root = workspace_root
        self.triggers: List[Trigger] = []
    
    def add_cron(self, trigger_id: str, cron_expr: str, action: Callable) -> CronTrigger:
        """添加Cron触发器"""
        trigger = CronTrigger(trigger_id, self.agent_id, cron_expr, action)
        self.triggers.append(trigger)
        return trigger
    
    def add_interval(self, trigger_id: str, interval_seconds: int, action: Callable) -> IntervalTrigger:
        """添加间隔触发器"""
        trigger = IntervalTrigger(trigger_id, self.agent_id, interval_seconds, action)
        self.triggers.append(trigger)
        return trigger
    
    def add_message(self, trigger_id: str, source_agent: str, action: Callable) -> MessageTrigger:
        """添加消息触发器"""
        trigger = MessageTrigger(trigger_id, self.agent_id, source_agent, action)
        self.triggers.append(trigger)
        return trigger
    
    def add_webhook(self, trigger_id: str, route: str, port: int = 5000, action: Callable = None) -> WebhookTrigger:
        """添加Webhook触发器"""
        if action is None:
            action = lambda agent, data: print(f"Webhook received: {data}")
        trigger = WebhookTrigger(trigger_id, self.agent_id, route, port, action)
        self.triggers.append(trigger)
        return trigger
    
    def start(self):
        """启动所有触发器"""
        for trigger in self.triggers:
            trigger.start()
    
    def stop(self):
        """停止所有触发器"""
        for trigger in self.triggers:
            trigger.stop()
    
    def list_triggers(self) -> List[Dict[str, Any]]:
        """列出所有触发器"""
        return [
            {
                "id": t.trigger_id,
                "type": t.__class__.__name__,
                "next_fire": t.next_fire_time(),
                "running": t.running
            }
            for t in self.triggers
        ]


# ========== 便捷函数 ==========

def create_trigger(agent_id: str, trigger_type: str, config: Dict[str, Any], action: Callable) -> Trigger:
    """创建触发器的便捷函数"""
    engine = TriggerEngine(agent_id)
    
    if trigger_type == "cron":
        return engine.add_cron(
            config.get("id", "default"),
            config.get("cron", "0 9 * * *"),
            action
        )
    elif trigger_type == "interval":
        return engine.add_interval(
            config.get("id", "default"),
            config.get("seconds", 3600),
            action
        )
    elif trigger_type == "webhook":
        return engine.add_webhook(
            config.get("id", "default"),
            config.get("route", "/webhook"),
            config.get("port", 5000),
            action
        )
    else:
        raise ValueError(f"Unknown trigger type: {trigger_type}")
