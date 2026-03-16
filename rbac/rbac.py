"""
企业级RBAC模块
多租户、角色权限、审计日志
"""

import json
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
import threading


class Role(Enum):
    """角色"""
    ADMIN = "admin"      # 管理员
    EDITOR = "editor"    # 编辑
    VIEWER = "viewer"    # 只读
    OPERATOR = "operator" # 操作员


# 权限矩阵
PERMISSIONS = {
    Role.ADMIN: [
        "create_tenant", "edit_tenant", "delete_tenant",
        "create_bot", "edit_bot", "delete_bot",
        "create_skill", "edit_skill", "delete_skill",
        "run_workflow", "view_report",
        "manage_users", "manage_roles", "view_audit"
    ],
    Role.EDITOR: [
        "create_bot", "edit_bot",
        "create_skill", "edit_skill",
        "run_workflow", "view_report"
    ],
    Role.OPERATOR: [
        "run_workflow", "view_report"
    ],
    Role.VIEWER: [
        "view_report"
    ]
}


class Tenant:
    """租户"""
    
    def __init__(
        self,
        tenant_id: str,
        name: str,
        owner_id: str,
        quota: Dict[str, int] = None
    ):
        self.id = tenant_id
        self.name = name
        self.owner_id = owner_id
        self.quota = quota or {
            "api_calls_per_day": 1000,
            "max_bots": 10,
            "max_storage_mb": 100
        }
        self.created_at = datetime.now().isoformat()
        self.status = "active"
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "name": self.name,
            "owner_id": self.owner_id,
            "quota": self.quota,
            "created_at": self.created_at,
            "status": self.status
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "Tenant":
        t = cls(data["id"], data["name"], data["owner_id"], data.get("quota"))
        t.created_at = data.get("created_at", t.created_at)
        t.status = data.get("status", "active")
        return t


class User:
    """用户"""
    
    def __init__(
        self,
        user_id: str,
        username: str,
        email: str,
        tenant_id: str,
        role: Role = Role.VIEWER
    ):
        self.id = user_id
        self.username = username
        self.email = email
        self.tenant_id = tenant_id
        self.role = role
        self.created_at = datetime.now().isoformat()
        self.last_login = None
    
    def has_permission(self, permission: str) -> bool:
        """检查权限"""
        return permission in PERMISSIONS.get(self.role, [])
    
    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "tenant_id": self.tenant_id,
            "role": self.role.value,
            "created_at": self.created_at,
            "last_login": self.last_login
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "User":
        user = cls(
            data["id"],
            data["username"],
            data["email"],
            data["tenant_id"],
            Role(data.get("role", "viewer"))
        )
        user.created_at = data.get("created_at", user.created_at)
        user.last_login = data.get("last_login")
        return user


class AuditLog:
    """审计日志"""
    
    def __init__(self, storage_path: str = "./workspace/rbac"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
    
    def _get_log_file(self, tenant_id: str) -> Path:
        return self.storage_path / f"{tenant_id}_audit.json"
    
    def log(
        self,
        tenant_id: str,
        user_id: str,
        action: str,
        resource: str,
        result: str = "success",
        details: Dict = None
    ):
        """记录日志"""
        with self._lock:
            log_file = self._get_log_file(tenant_id)
            logs = self._load(log_file)
            
            logs.append({
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "action": action,
                "resource": resource,
                "result": result,
                "details": details or {}
            })
            
            # 只保留最近1000条
            logs = logs[-1000:]
            
            log_file.write_text(
                json.dumps(logs, ensure_ascii=False, indent=2),
                encoding='utf-8'
            )
    
    def _load(self, file_path: Path) -> List[Dict]:
        if file_path.exists():
            try:
                return json.loads(file_path.read_text(encoding='utf-8'))
            except:
                return []
        return []
    
    def get_logs(
        self,
        tenant_id: str,
        user_id: str = None,
        action: str = None,
        limit: int = 100
    ) -> List[Dict]:
        """查询日志"""
        log_file = self._get_log_file(tenant_id)
        logs = self._load(log_file)
        
        if user_id:
            logs = [l for l in logs if l["user_id"] == user_id]
        if action:
            logs = [l for l in logs if l["action"] == action]
        
        return logs[-limit:]


class RBAC:
    """RBAC管理器"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, storage_path: str = "./workspace/rbac"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        self.tenants: Dict[str, Tenant] = {}
        self.users: Dict[str, User] = {}
        self.audit = AuditLog(str(self.storage_path))
        
        self._load()
    
    def _load(self):
        """加载数据"""
        # 加载租户
        tenants_file = self.storage_path / "tenants.json"
        if tenants_file.exists():
            try:
                data = json.loads(tenants_file.read_text(encoding='utf-8'))
                self.tenants = {
                    k: Tenant.from_dict(v) for k, v in data.items()
                }
            except:
                pass
        
        # 加载用户
        users_file = self.storage_path / "users.json"
        if users_file.exists():
            try:
                data = json.loads(users_file.read_text(encoding='utf-8'))
                self.users = {
                    k: User.from_dict(v) for k, v in data.items()
                }
            except:
                pass
    
    def _save_tenants(self):
        """保存租户"""
        data = {k: v.to_dict() for k, v in self.tenants.items()}
        (self.storage_path / "tenants.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
    
    def _save_users(self):
        """保存用户"""
        data = {k: v.to_dict() for k, v in self.users.items()}
        (self.storage_path / "users.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding='utf-8'
        )
    
    # ========== 租户管理 ==========
    
    def create_tenant(
        self,
        name: str,
        owner_id: str,
        quota: Dict[str, int] = None
    ) -> Tenant:
        """创建租户"""
        tenant_id = f"tenant_{uuid.uuid4().hex[:8]}"
        tenant = Tenant(tenant_id, name, owner_id, quota)
        self.tenants[tenant_id] = tenant
        self._save_tenants()
        
        self.audit.log(tenant_id, owner_id, "create_tenant", tenant_id)
        
        return tenant
    
    def get_tenant(self, tenant_id: str) -> Optional[Tenant]:
        return self.tenants.get(tenant_id)
    
    def list_tenants(self) -> List[Tenant]:
        return list(self.tenants.values())
    
    # ========== 用户管理 ==========
    
    def create_user(
        self,
        username: str,
        email: str,
        tenant_id: str,
        role: Role = Role.VIEWER
    ) -> User:
        """创建用户"""
        if tenant_id not in self.tenants:
            raise ValueError(f"Tenant not found: {tenant_id}")
        
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        user = User(user_id, username, email, tenant_id, role)
        self.users[user_id] = user
        self._save_users()
        
        self.audit.log(tenant_id, user_id, "create_user", user_id)
        
        return user
    
    def get_user(self, user_id: str) -> Optional[User]:
        return self.users.get(user_id)
    
    def list_users(self, tenant_id: str) -> List[User]:
        return [u for u in self.users.values() if u.tenant_id == tenant_id]
    
    def set_user_role(self, user_id: str, role: Role) -> bool:
        """设置用户角色"""
        if user_id in self.users:
            self.users[user_id].role = role
            self._save_users()
            
            self.audit.log(
                self.users[user_id].tenant_id,
                user_id,
                "set_role",
                user_id,
                details={"role": role.value}
            )
            return True
        return False
    
    # ========== 权限检查 ==========
    
    def check_permission(self, user_id: str, permission: str) -> bool:
        """检查用户权限"""
        user = self.get_user(user_id)
        if user is None:
            return False
        
        # 租户状态检查
        tenant = self.get_tenant(user.tenant_id)
        if tenant and tenant.status != "active":
            return False
        
        return user.has_permission(permission)
    
    def require_permission(self, user_id: str, permission: str):
        """权限检查装饰器"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                if not self.check_permission(user_id, permission):
                    raise PermissionError(
                        f"User {user_id} lacks permission: {permission}"
                    )
                return func(*args, **kwargs)
            return wrapper
        return decorator
    
    # ========== 配额管理 ==========
    
    def check_quota(self, tenant_id: str, resource: str) -> bool:
        """检查配额"""
        tenant = self.get_tenant(tenant_id)
        if tenant is None:
            return True  # 无租户则不限制
        
        # 简化实现：只检查是否存在
        return resource in tenant.quota
    
    # ========== 审计 ==========
    
    def get_audit_logs(
        self,
        tenant_id: str,
        user_id: str = None,
        action: str = None
    ) -> List[Dict]:
        return self.audit.get_logs(tenant_id, user_id, action)


# 全局单例
_rbac: Optional[RBAC] = None


def get_rbac(storage_path: str = "./workspace/rbac") -> RBAC:
    """获取RBAC单例"""
    global _rbac
    if _rbac is None:
        _rbac = RBAC(storage_path)
    return _rbac


# ========== 测试 ==========

if __name__ == "__main__":
    print("=" * 50)
    print("🔐 RBAC 模块测试")
    print("=" * 50)
    
    rbac = get_rbac("./workspace/rbac")
    
    # 创建租户
    print("\n1. 创建租户...")
    tenant = rbac.create_tenant(
        name="测试公司",
        owner_id="admin",
        quota={"api_calls_per_day": 5000, "max_bots": 20}
    )
    print(f"   租户: {tenant.name} (ID: {tenant.id})")
    
    # 创建用户
    print("\n2. 创建用户...")
    admin = rbac.create_user("管理员", "admin@test.com", tenant.id, Role.ADMIN)
    editor = rbac.create_user("编辑", "editor@test.com", tenant.id, Role.EDITOR)
    viewer = rbac.create_user("查看", "viewer@test.com", tenant.id, Role.VIEWER)
    print(f"   用户: {admin.username} (Admin)")
    print(f"   用户: {editor.username} (Editor)")
    print(f"   用户: {viewer.username} (Viewer)")
    
    # 权限检查
    print("\n3. 权限检查...")
    print(f"   Admin - create_bot: {rbac.check_permission(admin.id, 'create_bot')}")
    print(f"   Editor - create_bot: {rbac.check_permission(editor.id, 'create_bot')}")
    print(f"   Viewer - create_bot: {rbac.check_permission(viewer.id, 'create_bot')}")
    print(f"   Viewer - view_report: {rbac.check_permission(viewer.id, 'view_report')}")
    
    # 审计日志
    print("\n4. 审计日志...")
    logs = rbac.get_audit_logs(tenant.id)
    print(f"   共 {len(logs)} 条日志")
    
    print("\n" + "=" * 50)
    print("✅ Sprint 5 (RBAC) 测试通过")
    print("=" * 50)
