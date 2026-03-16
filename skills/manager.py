"""
Skills 动态扩展模块
让Bot能运行时发现和安装新技能
"""

import os
import json
import importlib.util
import inspect
from pathlib import Path
from typing import Callable, Dict, Any, List, Optional
from datetime import datetime
import threading


class SkillManifest:
    """Skill元数据"""
    
    def __init__(
        self,
        skill_id: str,
        name: str,
        version: str,
        description: str,
        author: str = "",
        tags: List[str] = None,
        dependencies: List[str] = None,
        entry_point: str = "main"
    ):
        self.id = skill_id
        self.name = name
        self.version = version
        self.description = description
        self.author = author
        self.tags = tags or []
        self.dependencies = dependencies or []
        self.entry_point = entry_point
    
    @classmethod
    def from_dict(cls, data: Dict) -> "SkillManifest":
        return cls(
            skill_id=data.get("id", ""),
            name=data.get("name", ""),
            version=data.get("version", "1.0.0"),
            description=data.get("description", ""),
            author=data.get("author", ""),
            tags=data.get("tags", []),
            dependencies=data.get("dependencies", []),
            entry_point=data.get("entry_point", "main")
        )
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "author": self.author,
            "tags": self.tags,
            "dependencies": self.dependencies,
            "entry_point": self.entry_point
        }


class Skill:
    """Skill实体"""
    
    def __init__(
        self,
        manifest: SkillManifest,
        func: Callable,
        source: str = "local",  # local, modelscope, smithery
        installed_at: str = None
    ):
        self.manifest = manifest
        self.func = func
        self.source = source
        self.installed_at = installed_at or datetime.now().isoformat()
    
    def invoke(self, *args, **kwargs) -> Any:
        """调用Skill"""
        return self.func(*args, **kwargs)
    
    def __call__(self, *args, **kwargs):
        return self.invoke(*args, **kwargs)
    
    def to_dict(self) -> Dict:
        return {
            "manifest": self.manifest.to_dict(),
            "source": self.source,
            "installed_at": self.installed_at
        }


class LocalSkillLoader:
    """本地Skill加载器"""
    
    def __init__(self, skills_path: str = "./skills/store"):
        self.skills_path = Path(skills_path)
        self.skills_path.mkdir(parents=True, exist_ok=True)
    
    def discover(self) -> List[SkillManifest]:
        """发现本地Skills"""
        manifests = []
        
        for skill_dir in self.skills_path.iterdir():
            if not skill_dir.is_dir():
                continue
            
            manifest_file = skill_dir / "skill.json"
            if manifest_file.exists():
                try:
                    data = json.loads(manifest_file.read_text(encoding='utf-8'))
                    manifests.append(SkillManifest.from_dict(data))
                except Exception as e:
                    print(f"Failed to load manifest from {skill_dir}: {e}")
        
        return manifests
    
    def load(self, skill_id: str) -> Optional[Skill]:
        """加载指定Skill"""
        skill_dir = self.skills_path / skill_id
        
        if not skill_dir.exists():
            return None
        
        # 加载manifest
        manifest_file = skill_dir / "skill.json"
        if not manifest_file.exists():
            return None
        
        manifest_data = json.loads(manifest_file.read_text(encoding='utf-8'))
        manifest = SkillManifest.from_dict(manifest_data)
        
        # 加载Python模块
        entry_file = skill_dir / f"{manifest.entry_point}.py"
        if not entry_file.exists():
            return None
        
        try:
            spec = importlib.util.spec_from_file_location(
                f"skill_{skill_id}",
                entry_file
            )
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # 查找可调用函数
            func = None
            for name, obj in inspect.getmembers(module):
                if name.startswith("_"):
                    continue
                if callable(obj) and name == manifest.entry_point:
                    func = obj
                    break
            
            if func:
                return Skill(manifest, func, source="local")
        except Exception as e:
            print(f"Failed to load skill {skill_id}: {e}")
        
        return None


class ModelScopeAdapter:
    """ModelScope技能市场适配器"""
    
    def __init__(self):
        self.api_base = "https://modelscope.cn/api/v1"
    
    async def search(self, query: str) -> List[SkillManifest]:
        """搜索ModelScope上的技能"""
        # 简化实现：返回示例数据
        # 实际需要调用ModelScope API
        return [
            SkillManifest(
                skill_id="modelscope.image_gen",
                name="AI图片生成",
                version="1.0.0",
                description="基于ModelScope的AI图片生成技能",
                tags=["AI", "图像", "生成"]
            ),
            SkillManifest(
                skill_id="modelscope.nlp_translate",
                name="翻译助手",
                version="1.0.0",
                description="多语言翻译技能",
                tags=["NLP", "翻译"]
            )
        ]
    
    async def install(self, skill_id: str, target_path: Path) -> bool:
        """安装ModelScope技能"""
        # 简化实现：创建示例文件
        skill_dir = target_path / skill_id
        skill_dir.mkdir(parents=True, exist_ok=True)
        
        manifest = SkillManifest(
            skill_id=skill_id,
            name=skill_id.split(".")[-1],
            version="1.0.0",
            description=f"从ModelScope安装的技能: {skill_id}",
            source="modelscope"
        )
        
        (skill_dir / "skill.json").write_text(
            json.dumps(manifest.to_dict(), ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
        
        # 创建示例代码
        code = f'''
def main(*args, **kwargs):
    """ModelScope Skill: {skill_id}"""
    return {{"result": "executed {skill_id}"}}
'''
        (skill_dir / "main.py").write_text(code, encoding='utf-8')
        
        return True


class SkillManager:
    """Skill管理器 - 统一管理所有Skills"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, skills_path: str = "./skills/store"):
        self.skills_path = Path(skills_path)
        self.skills_path.mkdir(parents=True, exist_ok=True)
        
        self.local_loader = LocalSkillLoader(str(self.skills_path))
        self.modelscope = ModelScopeAdapter()
        
        # 注册表：skill_id -> Skill
        self._registry: Dict[str, Skill] = {}
        
        # 加载已安装的本地Skills
        self._load_local_skills()
    
    def _load_local_skills(self):
        """加载本地Skills"""
        manifests = self.local_loader.discover()
        for manifest in manifests:
            skill = self.local_loader.load(manifest.id)
            if skill:
                self._registry[manifest.id] = skill
    
    def install_local(self, skill_id: str) -> bool:
        """安装本地Skill"""
        skill = self.local_loader.load(skill_id)
        if skill:
            self._registry[skill_id] = skill
            return True
        return False
    
    async def install_modelscope(self, skill_id: str) -> bool:
        """从ModelScope安装Skill"""
        success = await self.modelscope.install(
            skill_id, 
            self.skills_path
        )
        if success:
            # 重新加载
            return self.install_local(skill_id)
        return False
    
    def uninstall(self, skill_id: str) -> bool:
        """卸载Skill"""
        if skill_id in self._registry:
            del self._registry[skill_id]
            
            # 删除文件
            skill_dir = self.skills_path / skill_id
            if skill_dir.exists():
                import shutil
                shutil.rmtree(skill_dir)
            return True
        return False
    
    def get(self, skill_id: str) -> Optional[Skill]:
        """获取Skill"""
        return self._registry.get(skill_id)
    
    def list(self, source: str = None) -> List[Skill]:
        """列出所有Skills"""
        skills = list(self._registry.values())
        if source:
            skills = [s for s in skills if s.source == source]
        return skills
    
    def invoke(self, skill_id: str, *args, **kwargs) -> Any:
        """调用Skill"""
        skill = self.get(skill_id)
        if skill is None:
            raise ValueError(f"Skill not found: {skill_id}")
        return skill.invoke(*args, **kwargs)
    
    def search_local(self, query: str) -> List[SkillManifest]:
        """搜索本地Skills"""
        manifests = self.local_loader.discover()
        query = query.lower()
        return [
            m for m in manifests
            if query in m.name.lower() or query in m.description.lower()
        ]


# 全局单例
_skill_manager: Optional[SkillManager] = None


def get_skill_manager(skills_path: str = "./skills/store") -> SkillManager:
    """获取Skill管理器单例"""
    global _skill_manager
    if _skill_manager is None:
        _skill_manager = SkillManager(skills_path)
    return _skill_manager


# ========== 示例Skills ==========

def create_sample_skill():
    """创建示例Skill"""
    skill_dir = Path("./skills/store/sample_skill")
    skill_dir.mkdir(parents=True, exist_ok=True)
    
    # skill.json
    manifest = SkillManifest(
        skill_id="sample_skill",
        name="示例技能",
        version="1.0.0",
        description="这是一个示例技能，用于演示如何创建Skill",
        author="mut-kjbot",
        tags=["example", "demo"]
    )
    
    (skill_dir / "skill.json").write_text(
        json.dumps(manifest.to_dict(), ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    
    # main.py
    code = '''"""
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
'''
    
    (skill_dir / "main.py").write_text(code, encoding='utf-8')
    
    print(f"示例Skill已创建: {skill_dir}")
    return True


# ========== 测试 ==========

if __name__ == "__main__":
    print("=" * 50)
    print("🛠️ Skills 动态扩展模块测试")
    print("=" * 50)
    
    # 创建示例Skill
    print("\n1. 创建示例Skill...")
    create_sample_skill()
    
    # 获取管理器
    print("\n2. 加载Skill管理器...")
    manager = get_skill_manager("./skills/store")
    
    # 列出所有Skills
    print("\n3. 本地Skills:")
    for m in manager.local_loader.discover():
        print(f"   - {m.name} (v{m.version})")
    
    # 安装并调用
    print("\n4. 调用Skill:")
    manager.install_local("sample_skill")
    
    skill = manager.get("sample_skill")
    if skill:
        result = skill.invoke("小明")
        print(f"   结果: {result}")
        
        result2 = skill.func.analyze("Hello World")
        print(f"   分析: {result2}")
    
    # 列出已安装
    print("\n5. 已安装Skills:")
    for s in manager.list():
        print(f"   - {s.manifest.name} (from {s.source})")
    
    print("\n" + "=" * 50)
    print("✅ 测试完成")
    print("=" * 50)
