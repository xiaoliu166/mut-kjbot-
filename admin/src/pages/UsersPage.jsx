import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, Edit, Trash2, Shield } from 'lucide-react'

const mockUsers = [
  { id: 'u1', name: '管理员', email: 'admin@test.com', role: 'admin', tenant: '默认租户', status: 'active' },
  { id: 'u2', name: '张三', email: 'zhangsan@test.com', role: 'editor', tenant: '默认租户', status: 'active' },
  { id: 'u3', name: '李四', email: 'lisi@test.com', role: 'operator', tenant: '默认租户', status: 'active' },
  { id: 'u4', name: '王五', email: 'wangwu@test.com', role: 'viewer', tenant: '默认租户', status: 'inactive' },
]

const mockTenants = [
  { id: 't1', name: '默认租户', users: 4, bots: 4, status: 'active' },
  { id: 't2', name: '测试租户', users: 2, bots: 2, status: 'active' },
]

const roles = [
  { id: 'admin', name: '管理员', desc: '完全控制权限', color: 'bg-red-100 text-red-700' },
  { id: 'editor', name: '编辑', desc: '可以编辑Bot和Skills', color: 'bg-blue-100 text-blue-700' },
  { id: 'operator', name: '操作员', desc: '可以运行工作流', color: 'bg-green-100 text-green-700' },
  { id: 'viewer', name: '查看者', desc: '只读权限', color: 'bg-slate-100 text-slate-700' },
]

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState(mockUsers)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          用户权限
        </h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === 'users' 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          用户列表
        </button>
        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === 'tenants' 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          租户管理
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            activeTab === 'roles' 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          角色权限
        </button>
      </div>

      {/* 用户列表 */}
      {activeTab === 'users' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">用户名</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">邮箱</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">角色</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">租户</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">状态</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-slate-50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-slate-500">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${roles.find(r => r.id === user.role)?.color}`}>
                        {roles.find(r => r.id === user.role)?.name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{user.tenant}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.status === 'active' ? '活跃' : '未激活'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* 租户管理 */}
      {activeTab === 'tenants' && (
        <div className="grid gap-4 md:grid-cols-2">
          {mockTenants.map((tenant) => (
            <Card key={tenant.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{tenant.name}</CardTitle>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tenant.status === 'active' ? '活跃' : '已禁用'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">用户数</span>
                    <span className="font-medium">{tenant.users}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bot数</span>
                    <span className="font-medium">{tenant.bots}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 角色权限 */}
      {activeTab === 'roles' && (
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <CardTitle>{role.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">{role.desc}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">权限列表</p>
                  {role.id === 'admin' && ['创建Bot', '编辑Bot', '删除Bot', '管理用户', '查看日志'].map(p => (
                    <p key={p} className="text-sm text-slate-500">✓ {p}</p>
                  ))}
                  {role.id === 'editor' && ['创建Bot', '编辑Bot', '运行工作流', '查看日志'].map(p => (
                    <p key={p} className="text-sm text-slate-500">✓ {p}</p>
                  ))}
                  {role.id === 'operator' && ['运行工作流', '查看日志'].map(p => (
                    <p key={p} className="text-sm text-slate-500">✓ {p}</p>
                  ))}
                  {role.id === 'viewer' && ['查看日志'].map(p => (
                    <p key={p} className="text-sm text-slate-500">✓ {p}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
