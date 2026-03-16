"""
示例Skill
"""

def main(name: str = "World") -> str:
    """打招呼技能"""
    return f"Hello, {name}! This is a sample skill."

def analyze(text: str) -> dict:
    """简单的文本分析"""
    return {
        "length": len(text),
        "words": len(text.split()),
        "upper": text.upper()
    }
