"""
多模型支持模块 v2
支持 OpenAI / DeepSeek / Claude / Ollama / Gemini / 文心一言 / 通义千问 / 智谱AI
"""

import os
import json
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from pathlib import Path


class LLMAdapter(ABC):
    """LLM适配器基类"""
    
    @abstractmethod
    def chat(self, messages: List[Dict], **kwargs) -> str:
        """发送聊天请求"""
        pass
    
    @abstractmethod
    def get_model_name(self) -> str:
        """获取模型名称"""
        pass
    
    @property
    def available(self) -> bool:
        return True


# ========== OpenAI ==========

class OpenAIAdapter(LLMAdapter):
    """OpenAI适配器"""
    
    def __init__(self, model: str = "gpt-4o", api_key: str = None, base_url: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.base_url = base_url or "https://api.openai.com/v1"
        
        try:
            from langchain_openai import ChatOpenAI
            self.llm = ChatOpenAI(model=model, openai_api_key=self.api_key, openai_api_base=self.base_url, temperature=0.7)
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] OpenAI {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"openai:{self.model}"


# ========== DeepSeek ==========

class DeepSeekAdapter(LLMAdapter):
    """DeepSeek适配器"""
    
    def __init__(self, model: str = "deepseek-chat", api_key: str = None, base_url: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = base_url or "https://api.deepseek.com/v1"
        
        try:
            from langchain_openai import ChatOpenAI
            self.llm = ChatOpenAI(model=model, openai_api_key=self.api_key, openai_api_base=self.base_url, temperature=0.7)
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] DeepSeek {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"deepseek:{self.model}"


# ========== Claude ==========

class ClaudeAdapter(LLMAdapter):
    """Claude适配器"""
    
    def __init__(self, model: str = "claude-3-opus-20240229", api_key: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        
        try:
            from langchain_anthropic import ChatAnthropic
            self.llm = ChatAnthropic(model=model, anthropic_api_key=self.api_key, temperature=0.7)
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] Claude {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"anthropic:{self.model}"


# ========== Ollama ==========

class OllamaAdapter(LLMAdapter):
    """Ollama本地模型适配器"""
    
    def __init__(self, model: str = "llama2", base_url: str = None):
        self.model = model
        self.base_url = base_url or "http://localhost:11434"
        self._available = False
        
        try:
            import requests
            self.requests = requests
            resp = requests.get(f"{self.base_url}/api/tags", timeout=2)
            self._available = resp.status_code == 200
        except:
            pass
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] Ollama {self.model}: {messages[-1].get('content', '')[:50]}..."
        resp = self.requests.post(
            f"{self.base_url}/api/chat",
            json={"model": self.model, "messages": messages, "stream": False}
        )
        if resp.status_code == 200:
            return resp.json().get("message", {}).get("content", "")
        return f"[Error] Ollama: {resp.status_code}"
    
    def get_model_name(self) -> str:
        return f"ollama:{self.model}"


# ========== Gemini ==========

class GeminiAdapter(LLMAdapter):
    """Google Gemini适配器"""
    
    def __init__(self, model: str = "gemini-pro", api_key: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY", "")
        
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            self.llm = ChatGoogleGenerativeAI(model=model, google_api_key=self.api_key, temperature=0.7)
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] Gemini {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"google:{self.model}"


# ========== 文心一言 ==========

class WenxinAdapter(LLMAdapter):
    """百度文心一言适配器"""
    
    def __init__(self, model: str = "ernie-4.0-8k", api_key: str = None, secret_key: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("ERNIE_API_KEY", "")
        self.secret_key = secret_key or os.getenv("ERNIE_SECRET_KEY", "")
        
        try:
            from langchain_community.chat_models import ErnieBotChat
            self.llm = ErnieBotChat(ernie_client_id=self.api_key, ernie_client_secret=self.secret_key)
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] 文心一言 {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"wenxin:{self.model}"


# ========== 通义千问 ==========

class TongyiAdapter(LLMAdapter):
    """阿里通义千问适配器"""
    
    def __init__(self, model: str = "qwen-turbo", api_key: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("DASHSCOPE_API_KEY", "")
        
        try:
            from langchain_openai import ChatOpenAI
            self.llm = ChatOpenAI(
                model=model,
                openai_api_key=self.api_key,
                openai_api_base="https://dashscope.aliyuncs.com/compatible-mode/v1",
                temperature=0.7
            )
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] 通义千问 {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"tongyi:{self.model}"


# ========== 智谱AI ==========

class ZhipuAdapter(LLMAdapter):
    """智谱AI适配器"""
    
    def __init__(self, model: str = "glm-4", api_key: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("ZHIPU_API_KEY", "")
        
        try:
            from langchain_community.chat_models import ChatZhipuAI
            self.llm = ChatZhipuAI(model=model, zhipu_api_key=self.api_key, temperature=0.7)
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] 智谱AI {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"zhipu:{self.model}"


# ========== MiniMax ==========

class MiniMaxAdapter(LLMAdapter):
    """MiniMax适配器"""
    
    def __init__(self, model: str = "abab6.5s-chat", api_key: str = None):
        self.model = model
        self.api_key = api_key or os.getenv("MINIMAX_API_KEY", "")
        
        try:
            from langchain_openai import ChatOpenAI
            self.llm = ChatOpenAI(
                model=model,
                openai_api_key=self.api_key,
                openai_api_base="https://api.minimax.chat/v1",
                temperature=0.7
            )
            self._available = True
        except ImportError:
            self._available = False
    
    @property
    def available(self) -> bool:
        return self._available
    
    def chat(self, messages: List[Dict], **kwargs) -> str:
        if not self._available:
            return f"[Mock] MiniMax {self.model}: {messages[-1].get('content', '')[:50]}..."
        from langchain.schema import HumanMessage
        langchain_messages = [HumanMessage(content=m.get("content", "")) for m in messages]
        return self.llm.invoke(langchain_messages).content
    
    def get_model_name(self) -> str:
        return f"minimax:{self.model}"


# ========== 模型工厂 ==========

class ModelFactory:
    """模型工厂"""
    
    _adapters: Dict[str, type] = {
        "openai": OpenAIAdapter,
        "deepseek": DeepSeekAdapter,
        "anthropic": ClaudeAdapter,
        "ollama": OllamaAdapter,
        "google": GeminiAdapter,
        "wenxin": WenxinAdapter,
        "tongyi": TongyiAdapter,
        "zhipu": ZhipuAdapter,
        "minimax": MiniMaxAdapter,
    }
    
    _current: Optional[LLMAdapter] = None
    
    @classmethod
    def get_adapter(cls, provider: str, **kwargs) -> LLMAdapter:
        """获取适配器"""
        if provider not in cls._adapters:
            raise ValueError(f"Unknown provider: {provider}. Available: {list(cls._adapters.keys())}")
        return cls._adapters[provider](**kwargs)
    
    @classmethod
    def set_default(cls, provider: str, **kwargs):
        """设置默认模型"""
        cls._current = cls.get_adapter(provider, **kwargs)
    
    @classmethod
    def get_default(cls) -> LLMAdapter:
        """获取默认模型"""
        if cls._current is None:
            cls._current = OpenAIAdapter()
        return cls._current
    
    @classmethod
    def chat(cls, messages: List[Dict], **kwargs) -> str:
        """快捷聊天"""
        return cls.get_default().chat(messages, **kwargs)
    
    @classmethod
    def list_providers(cls) -> List[Dict]:
        """列出所有可用的模型提供商"""
        providers = []
        for name, adapter_class in cls._adapters.items():
            try:
                adapter = adapter_class()
                providers.append({
                    "id": name,
                    "name": name.title(),
                    "available": adapter.available,
                    "models": cls._get_models(name)
                })
            except Exception as e:
                providers.append({
                    "id": name,
                    "name": name.title(),
                    "available": False,
                    "error": str(e)
                })
        return providers
    
    @classmethod
    def _get_models(cls, provider: str) -> List[str]:
        """获取提供商支持的模型列表"""
        models = {
            "openai": ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
            "deepseek": ["deepseek-chat", "deepseek-coder"],
            "anthropic": ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
            "ollama": ["llama2", "mistral", "codellama"],
            "google": ["gemini-pro", "gemini-pro-vision"],
            "wenxin": ["ernie-4.0-8k", "ernie-3.5-8k"],
            "tongyi": ["qwen-turbo", "qwen-plus", "qwen-max"],
            "zhipu": ["glm-4", "glm-3-turbo"],
            "minimax": ["abab6.5s-chat", "abab6-chat"],
        }
        return models.get(provider, [])


# ========== 配置管理 ==========

def load_model_config(config_path: str = "./workspace/model_config.json") -> Dict:
    """加载模型配置"""
    path = Path(config_path)
    if path.exists():
        return json.loads(path.read_text(encoding='utf-8'))
    return {"provider": "openai", "model": "gpt-4o", "api_key": "", "base_url": None}


def save_model_config(config: Dict, config_path: str = "./workspace/model_config.json"):
    """保存模型配置"""
    path = Path(config_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding='utf-8')


# ========== 测试 ==========

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 多模型支持 v2 测试")
    print("=" * 60)
    
    # 列出所有提供商
    print("\n📋 可用模型提供商:")
    for p in ModelFactory.list_providers():
        status = "✅" if p["available"] else "❌"
        print(f"   {status} {p['name']}: {p.get('models', [])[:3]}")
    
    # 测试各个适配器
    print("\n🧪 适配器测试:")
    messages = [{"role": "user", "content": "你好"}]
    
    for provider in ["openai", "deepseek", "anthropic", "google", "tongyi", "zhipu", "minimax", "ollama"]:
        try:
            adapter = ModelFactory.get_adapter(provider, model="test")
            name = adapter.get_model_name()
            print(f"   ✅ {provider}: {name}")
        except Exception as e:
            print(f"   ❌ {provider}: {e}")
    
    print("\n" + "=" * 60)
    print("✅ 测试完成")
    print("=" * 60)
