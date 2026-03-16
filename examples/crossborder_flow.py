"""
mut-kjbot 示例：跨境电商多Bot协作流程（支持Agent持久化）

Bot序列：选品Bot → 投放Bot → 运营Bot → 合规Bot
通信模式：链式传递 (Sequential)

新增功能：
- 每个Bot拥有独立人格(soul.md)和记忆(memory.md)
- 重启后Bot能保留历史记忆
"""

import os
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

# 设置API Key
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "sk-xxx")

from langchain_openai import ChatOpenAI
from agent.agent import get_agent, Agent

# ========== 配置 ==========
WORKSPACE_ROOT = "./workspace"

# 初始化LLM
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)


def get_bot_prompt(bot_type: str) -> str:
    """获取Bot的人格提示词"""
    agent = get_agent(bot_type, WORKSPACE_ROOT)
    return agent.get_system_prompt()


def remember_result(bot_type: str, key: str, value: str):
    """保存Bot的分析结果到记忆"""
    agent = get_agent(bot_type, WORKSPACE_ROOT)
    agent.remember(key, value)


# ========== 定义状态 ==========
class AgentState(TypedDict):
    """多Agent共享状态"""
    messages: list
    product_idea: str
    market_analysis: str
    ad_strategy: str
    listing_content: str
    compliance_check: str
    final_output: str


# ========== 定义Bot ==========
def xuanpin_bot(state: AgentState) -> AgentState:
    """选品Bot：分析产品创意，提供市场分析"""
    product_idea = state.get("product_idea", "")
    
    # 获取人格提示词
    system_prompt = get_bot_prompt("selectors")
    
    prompt = f"""{system_prompt}

根据以下产品创意，进行市场分析：

产品创意：{product_idea}

请分析：
1. 市场规模
2. 竞争程度
3. 利润空间
4. 推荐指数 (1-5星)

请用中文回复。"""
    
    response = llm.invoke(prompt)
    market_analysis = response.content
    
    # 保存到记忆
    remember_result("selectors", "last_analysis", market_analysis)
    remember_result("selectors", "last_product", product_idea)
    
    return {"market_analysis": market_analysis}


def toufang_bot(state: AgentState) -> AgentState:
    """投放Bot：基于市场分析，制定广告策略"""
    market_analysis = state.get("market_analysis", "")
    product_idea = state.get("product_idea", "")
    
    system_prompt = get_bot_prompt("ads")
    
    prompt = f"""{system_prompt}

基于以下市场分析，制定广告策略：

产品创意：{product_idea}
市场分析：{market_analysis}

请给出：
1. 广告预算建议
2. 关键词策略
3. 出价策略
4. 投放节奏

请用中文回复。"""
    
    response = llm.invoke(prompt)
    ad_strategy = response.content
    
    remember_result("ads", "last_strategy", ad_strategy)
    
    return {"ad_strategy": ad_strategy}


def yunying_bot(state: AgentState) -> AgentState:
    """运营Bot：优化Listing内容"""
    product_idea = state.get("product_idea", "")
    market_analysis = state.get("market_analysis", "")
    
    system_prompt = get_bot_prompt("ops")
    
    prompt = f"""{system_prompt}

基于以下信息，优化Listing：

产品创意：{product_idea}
市场分析：{market_analysis}

请给出：
1. 标题建议 (英文)
2. 五点描述
3. A+内容要点

请用中文回复要点，英文内容用引号包裹。"""
    
    response = llm.invoke(prompt)
    listing_content = response.content
    
    remember_result("ops", "last_listing", listing_content)
    
    return {"listing_content": listing_content}


def hegui_bot(state: AgentState) -> AgentState:
    """合规Bot：检查合规性"""
    product_idea = state.get("product_idea", "")
    listing_content = state.get("listing_content", "")
    
    system_prompt = get_bot_prompt("compliance")
    
    prompt = f"""{system_prompt}

检查以下Listing是否合规：

产品创意：{product_idea}
Listing内容：{listing_content}

请检查：
1. 是否涉及侵权
2. 是否违反平台规则
3. 认证要求
4. 风险提示

请用中文回复。"""
    
    response = llm.invoke(prompt)
    compliance_check = response.content
    
    remember_result("compliance", "last_check", compliance_check)
    
    return {"compliance_check": compliance_check}


def final_output(state: AgentState) -> AgentState:
    """生成最终报告"""
    product_idea = state.get("product_idea", "")
    market_analysis = state.get("market_analysis", "")
    ad_strategy = state.get("ad_strategy", "")
    listing_content = state.get("listing_content", "")
    compliance_check = state.get("compliance_check", "")
    
    final_output = f"""
# 跨境电商解决方案报告

## 产品创意
{product_idea}

## 市场分析
{market_analysis}

## 广告策略
{ad_strategy}

## Listing优化
{listing_content}

## 合规检查
{compliance_check}

---
报告生成完成
"""
    
    return {"final_output": final_output}


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


# ========== 运行示例 ==========
if __name__ == "__main__":
    print("🚀 mut-kjbot 多Bot协作流程 (支持Agent持久化)")
    print("=" * 50)
    
    # 展示Bot人格
    print("\n📋 Bot人格设定预览：")
    for bot_id in ["selectors", "ads", "ops", "compliance"]:
        agent = get_agent(bot_id, WORKSPACE_ROOT)
        print(f"\n【{bot_id}】人格：")
        print(agent.soul.content[:100] + "..." if len(agent.soul.content) > 100 else agent.soul.content)
    
    # 创建工作流
    workflow = create_graph()
    
    initial_state = {
        "product_idea": "无线蓝牙耳机",
        "messages": []
    }
    
    print("\n" + "=" * 50)
    print("📦 输入：无线蓝牙耳机")
    print("=" * 50)
    
    # 执行流程
    result = workflow.invoke(initial_state)
    
    # 输出结果
    print("\n" + "=" * 50)
    print("📋 最终报告：")
    print("=" * 50)
    print(result["final_output"])
    
    # 验证记忆功能
    print("\n" + "=" * 50)
    print("💾 记忆验证：")
    print("=" * 50)
    for bot_id in ["selectors", "ads", "ops", "compliance"]:
        agent = get_agent(bot_id, WORKSPACE_ROOT)
        print(f"\n【{bot_id}】记忆：")
        print(json.dumps(agent.memory.all(), ensure_ascii=False, indent=2))

import json
