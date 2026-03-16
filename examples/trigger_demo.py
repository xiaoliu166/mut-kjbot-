"""
触发器系统示例
演示如何使用Cron、Interval、Message、Webhook触发器
"""

import time
import json
from trigger.engine import (
    TriggerEngine, 
    MessageBus,
    CronTrigger, 
    IntervalTrigger, 
    MessageTrigger, 
    WebhookTrigger
)
from agent.agent import get_agent


def demo_cron_trigger():
    """演示 Cron 定时触发器"""
    print("\n" + "=" * 50)
    print("📅 Cron 定时触发器示例")
    print("=" * 50)
    
    def my_task(agent):
        print(f"  [Cron] {agent.agent_id} 执行定时任务 at {time.strftime('%H:%M:%S')}")
        # 示例：每天9点生成报表
        # agent.remember("last_report_time", time.strftime('%Y-%m-%d %H:%M:%S'))
    
    engine = TriggerEngine("selectors")
    
    # 每分钟执行一次（测试用）
    trigger = engine.add_cron(
        "daily_report",
        "* * * * *",  # 每分钟
        my_task
    )
    
    engine.start()
    print("触发器已启动，每分钟执行一次")
    print(f"下次执行时间: {trigger.next_fire_time()}")
    
    # 运行5秒后停止
    time.sleep(5)
    engine.stop()
    print("触发器已停止")


def demo_interval_trigger():
    """演示间隔触发器"""
    print("\n" + "=" * 50)
    print("⏱️ 间隔触发器示例")
    print("=" * 50)
    
    counter = [0]
    
    def my_task(agent):
        counter[0] += 1
        print(f"  [Interval] 第 {counter[0]} 次执行 at {time.strftime('%H:%M:%S')}")
    
    engine = TriggerEngine("ads")
    
    # 每2秒执行一次
    trigger = engine.add_interval(
        "heartbeat",
        interval_seconds=2,
        action=my_task
    )
    
    engine.start()
    print("触发器已启动，每2秒执行一次")
    
    # 运行8秒后停止
    time.sleep(8)
    engine.stop()
    print("触发器已停止")


def demo_message_trigger():
    """演示消息触发器"""
    print("\n" + "=" * 50)
    print("💬 消息触发器示例")
    print("=" * 50)
    
    def notify_handler(agent):
        print(f"  [Message] {agent.agent_id} 收到新消息通知")
    
    # 创建投放Bot的触发器，监听选品Bot的消息
    engine = TriggerEngine("ads")
    engine.add_message(
        "xuanpin_notification",
        source_agent="selectors",
        action=notify_handler
    )
    engine.start()
    print("消息触发器已启动，监听 selectors 的消息")
    
    # 模拟选品Bot发送消息
    print("\n模拟选品Bot发送消息...")
    time.sleep(1)
    MessageBus.send("selectors", "ads", {
        "type": "product_analysis_done",
        "product": "蓝牙耳机",
        "result": "推荐"
    })
    
    time.sleep(2)
    engine.stop()
    print("触发器已停止")


def demo_webhook_trigger():
    """演示Webhook触发器"""
    print("\n" + "=" * 50)
    print("🔗 Webhook 触发器示例")
    print("=" * 50)
    
    def webhook_handler(agent, data):
        print(f"  [Webhook] {agent.agent_id} 收到Webhook请求: {data}")
    
    engine = TriggerEngine("ops")
    
    # 启动Webhook服务（端口5000，路由/webhook/ops）
    trigger = engine.add_webhook(
        "order_webhook",
        route="/webhook/ops",
        port=5000,
        action=webhook_handler
    )
    
    engine.start()
    print(f"Webhook 服务已启动: {trigger.next_fire_time()}")
    
    # 模拟发送Webhook请求
    print("\n模拟发送Webhook请求...")
    time.sleep(1)
    try:
        import requests
        resp = requests.post(
            "http://localhost:5000/webhook/ops",
            json={"order_id": "12345", "product": "鼠标"}
        )
        print(f"  响应: {resp.status_code}")
    except Exception as e:
        print(f"  请求失败: {e}")
    
    time.sleep(2)
    engine.stop()
    print("触发器已停止")


def demo_trigger_manager():
    """演示触发器管理器"""
    print("\n" + "=" * 50)
    print("🎛️ 触发器管理器示例")
    print("=" * 50)
    
    def task1(agent):
        print(f"  任务1执行")
    
    def task2(agent):
        print(f"  任务2执行")
    
    engine = TriggerEngine("compliance")
    
    # 添加多个触发器
    engine.add_cron("task1", "*/2 * * * *", task1)
    engine.add_interval("task2", 3, task2)
    
    engine.start()
    print(f"共 {len(engine.triggers)} 个触发器")
    print("触发器列表:", engine.list_triggers())
    
    time.sleep(5)
    engine.stop()
    print("所有触发器已停止")


if __name__ == "__main__":
    print("🚀 mut-kjbot 触发器系统演示")
    
    # 按顺序演示各种触发器
    # 注释掉不想运行的演示
    
    # 1. Cron定时触发器
    demo_cron_trigger()
    
    # 2. 间隔触发器
    demo_interval_trigger()
    
    # 3. 消息触发器
    demo_message_trigger()
    
    # 4. Webhook触发器（需要Flask）
    # demo_webhook_trigger()
    
    # 5. 触发器管理器
    demo_trigger_manager()
    
    print("\n" + "=" * 50)
    print("✅ 所有演示完成")
    print("=" * 50)
