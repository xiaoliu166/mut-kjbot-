"""
跨境电商多Bot协作流程 - Sprint 3完整版
集成Agent持久化 + 触发器 + 消息协作
"""

import os
import json
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "sk-xxx")

from langchain_openai import ChatOpenAI
from agent.agent import get_agent
from trigger.engine import TriggerEngine, MessageBus as TriggerMessageBus
from message.bus import AgentMessageBus, MessageType, MessagePriority

WORKSPACE_ROOT = "./workspace"
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)


# ========== 状态定义 ==========
class AgentState(TypedDict):
    messages: list
    product_idea: str
    market_analysis: str
    ad_strategy: str
    listing_content: str
    compliance_check: str
    final_output: str
    delegate_next: bool  # 是否委派给下一个Bot


# ========== Bot配置 ==========
BOTS = {
    "selectors": {
        "name": "选品Bot",
        "color": "🔍"
    },
    "ads": {
        "name": "投放Bot", 
        "color": "📢"
    },
    "ops": {
        "name": "运营Bot",
        "color": "📝"
    },
    "compliance": {
        "name": "合规Bot",
        "color": "✅"
    }
}


def get_bot_prompt(bot_id: str) -> str:
    """获取Bot人格提示词"""
    agent = get_agent(bot_id, WORKSPACE_ROOT)
    return agent.get_system_prompt()


def remember_result(bot_id: str, key: str, value: str):
    """保存结果到记忆"""
    agent = get_agent(bot_id, WORKSPACE_ROOT)
    agent.remember(key, value)


def send_to_next(bot_id: str, next_bot: str, state: AgentState):
    """发送消息给下一个Bot"""
    message_content = {
        "product_idea": state.get("product_idea", ""),
        "previous_result": state.get(f"{bot_id}_result", "")
    }
    
    AgentMessageBus.delegate_task(
        bot_id,
        next_bot,
        message_content,
        MessagePriority.NORMAL
    )
    print(f"  {BOTS[bot_id]['color']} → {BOTS[next_bot]['color']} 委派任务")


# ========== Bot节点 ==========
def xuanpin_bot(state: AgentState) -> AgentState:
    """选品Bot"""
    print(f"\n{BOTS['selectors']['color']} 选品Bot 开始工作...")
    product_idea = state.get("product_idea", "")
    
    system_prompt = get_bot_prompt("selectors")
    
    prompt = f"""{system_prompt}

产品创意：{product_idea}

请进行市场分析，给出推荐指数。"""
    
    response = llm.invoke(prompt)
    market_analysis = response.content
    
    # 记住结果
    remember_result("selectors", "last_analysis", market_analysis)
    
    state["market_analysis"] = market_analysis
    state["selectors_result"] = market_analysis
    state["delegate_next"] = True
    
    print(f"  → 分析完成，推荐指数已给出")
    
    return state


def toufang_bot(state: AgentState) -> AgentState:
    """投放Bot"""
    print(f"\n{BOTS['ads']['color']} 投放Bot 开始工作...")
    market_analysis = state.get("market_analysis", "")
    product_idea = state.get("product_idea", "")
    
    system_prompt = get_bot_prompt("ads")
    
    prompt = f"""{system_prompt}

产品创意：{product_idea}
市场分析：{market_analysis}

请制定广告策略。"""
    
    response = llm.invoke(prompt)
    ad_strategy = response.content
    
    remember_result("ads", "last_strategy", ad_strategy)
    
    state["ad_strategy"] = ad_strategy
    state["ads_result"] = ad_strategy
    state["delegate_next"] = True
    
    print(f"  → 策略制定完成")
    
    return state


def yunying_bot(state: AgentState) -> AgentState:
    """运营Bot"""
    print(f"\n{BOTS['ops']['color']} 运营Bot 开始工作...")
    product_idea = state.get("product_idea", "")
    market_analysis = state.get("market_analysis", "")
    
    system_prompt = get_bot_prompt("ops")
    
    prompt = f"""{system_prompt}

产品创意：{product_idea}
市场分析：{market_analysis}

请优化Listing。"""
    
    response = llm.invoke(prompt)
    listing_content = response.content
    
    remember_result("ops", "last_listing", listing_content)
    
    state["listing_content"] = listing_content
    state["ops_result"] = listing_content
    state["delegate_next"] = True
    
    print(f"  → Listing优化完成")
    
    return state


def hegui_bot(state: AgentState) -> AgentState:
    """合规Bot"""
    print(f"\n{BOTS['compliance']['color']} 合规Bot 开始工作...")
    product_idea = state.get("product_idea", "")
    listing_content = state.get("listing_content", "")
    
    system_prompt = get_bot_prompt("compliance")
    
    prompt = f"""{system_prompt}

产品创意：{product_idea}
Listing内容：{listing_content}

请检查合规性。"""
    
    response = llm.invoke(prompt)
    compliance_check = response.content
    
    remember_result("compliance", "last_check", compliance_check)
    
    state["compliance_check"] = compliance_check
    state["compliance_result"] = compliance_check
    state["delegate_next"] = False  # 最后一步，不再委派
    
    print(f"  → 合规检查完成")
    
    return state


def final_output(state: AgentState) -> AgentState:
    """生成最终报告"""
    
    # 协作完成，发送广播
    AgentMessageBus.broadcast(
        "system",
        {"type": "workflow_complete", "product": state.get("product_idea")}
    )
    
    final_output = f"""
╔══════════════════════════════════════════════════════════╗
║         跨境电商解决方案报告 - 协作完成                   ║
╚══════════════════════════════════════════════════════════╝

📦 产品：{state.get('product_idea', '')}

🔍 市场分析
{state.get('market_analysis', '')}

📢 广告策略  
{state.get('ad_strategy', '')}

📝 Listing优化
{state.get('listing_content', '')}

✅ 合规检查
{state.get('compliance_check', '')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
协作流程：选品 → 投放 → 运营 → 合规
报告生成时间：{__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    
    state["final_output"] = final_output
    return state


# ========== 构建流程图 ==========
def create_graph():
    """创建LangGraph工作流"""
    graph = StateGraph(AgentState)
    
    # 添加节点
    graph.add_node("xuanpin", xuanpin_bot)
    graph.add_node("toufang", toufang_bot)
    graph.add_node("yunying", yunying_bot)
    graph.add_node("hegui", hegui_bot)
    graph.add_node("final", final_output)
    
    # 定义流程
    graph.add_edge(START, "xuanpin")
    graph.add_edge("xuanpin", "toufang")
    graph.add_edge("toufang", "yunying")
    graph.add_edge("yunying", "hegui")
    graph.add_edge("hegui", "final")
    graph.add_edge("final", END)
    
    return graph.compile()


# ========== 运行 ==========
def run_workflow(product_idea: str):
    """运行完整协作流程"""
    print("\n" + "=" * 60)
    print(f"🚀 跨境电商多Bot协作流程启动")
    print(f"📦 产品：{product_idea}")
    print("=" * 60)
    
    workflow = create_graph()
    
    initial_state = {
        "product_idea": product_idea,
        "messages": [],
        "delegate_next": False
    }
    
    result = workflow.invoke(initial_state)
    
    print("\n" + "=" * 60)
    print("📋 最终报告")
    print("=" * 60)
    print(result["final_output"])
    
    return result


if __name__ == "__main__":
    # 运行协作流程
    result = run_workflow("无线蓝牙耳机")
    
    # 显示协作Feed
    print("\n" + "=" * 60)
    print("💬 协作消息记录")
    print("=" * 60)
    feed = AgentMessageBus.get_feed()
    for agent_id, messages in feed.items():
        print(f"\n【{agent_id}】收到 {len(messages)} 条消息")
        for m in messages:
            print(f"  • {m['type']} from {m['from']}")
