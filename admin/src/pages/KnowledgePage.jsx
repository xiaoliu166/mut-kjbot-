import { useState } from 'react'
import { 
  Plus, Search, FileText, Folder, Trash2, Edit, X, 
  Upload, File, BookOpen, Brain, Clock, CheckCircle
} from "lucide-react"

const mockKnowledge = [
  { 
    id: 1, 
    name: "Amazon运营手册", 
    type: "doc",
    size: "2.3 MB",
    chunks: 156,
    updatedAt: "2026-03-15",
    status: "indexed"
  },
  { 
    id: 2, 
    name: "竞品分析报告Q1", 
    type: "doc",
    size: "1.8 MB",
    chunks: 89,
    updatedAt: "2026-03-12",
    status: "indexed"
  },
  { 
    id: 3, 
    name: "广告投放策略", 
    type: "doc",
    size: "0.5 MB",
    chunks: 34,
    updatedAt: "2026-03-10",
    status: "indexed"
  },
  { 
    id: 4, 
    name: "合规检查清单", 
    type: "doc",
    size: "0.2 MB",
    chunks: 23,
    updatedAt: "2026-03-08",
    status: "indexed"
  },
  { 
    id: 5, 
    name: "产品描述模板", 
    type: "doc",
    size: "0.1 MB",
    chunks: 12,
    updatedAt: "2026-03-05",
    status: "indexed"
  },
]

const mockSearchResults = [
  { 
    id: 1,
    content: "根据Amazon最新政策，商品标题必须包含品牌名、产品名、主要特征...",
    source: "Amazon运营手册",
    score: 0.95
  },
  { 
    id: 2,
    content: "竞品A的定价策略分析：采用渗透定价法，价格区间$19.99-$24.99...",
    source: "竞品分析报告Q1",
    score: 0.87
  },
]

export default function KnowledgePage() {
  const [documents, setDocuments] = useState(mockKnowledge)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSearchPanel, setShowSearchPanel] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [newDoc, setNewDoc] = useState({ name: "", description: "" })

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setShowSearchPanel(true)
    setSearchResults(mockSearchResults)
  }

  const handleUpload = () => {
    if (!newDoc.name) return
    const doc = {
      id: documents.length + 1,
      ...newDoc,
      type: "doc",
      size: "0 MB",
      chunks: 0,
      updatedAt: new Date().toLocaleDateString("zh-CN"),
      status: "indexing"
    }
    setDocuments([doc, ...documents])
    setShowUploadModal(false)
    setNewDoc({ name: "", description: "" })
    
    // 模拟索引完成
    setTimeout(() => {
      setDocuments(docs => docs.map(d => 
        d.id === doc.id ? { ...d, status: "indexed", chunks: Math.floor(Math.random() * 50) + 10 } : d
      ))
    }, 3000)
  }

  const handleDelete = (id) => {
    setDocuments(documents.filter(d => d.id !== id))
    setSelectedDoc(null)
  }

  const statusConfig = {
    indexed: { label: "已索引", class: "bg-green-100 text-green-700", icon: CheckCircle },
    indexing: { label: "索引中", class: "bg-blue-100 text-blue-700", icon: Brain },
    failed: { label: "失败", class: "bg-red-100 text-red-700", icon: X },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">知识库</h1>
          <p className="text-gray-500 text-sm mt-1">管理文档知识，支持向量检索</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          上传文档
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索知识库内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            搜索
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => {
          const status = statusConfig[doc.status]
          const StatusIcon = status.icon
          
          return (
            <div 
              key={doc.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${status.class}`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-1">{doc.name}</h3>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{doc.size}</span>
                <span>{doc.chunks} 个片段</span>
                <span>更新于 {doc.updatedAt}</span>
              </div>
            </div>
          )
        })}
      </div>

      {documents.length === 0 && (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>暂无文档</p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="mt-3 text-blue-600 hover:underline text-sm"
          >
            上传第一个文档
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">上传文档</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">点击或拖拽文件到此处上传</p>
                <p className="text-xs text-gray-400 mt-1">支持 PDF、TXT、DOCX 格式</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">文档名称</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="输入文档名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  placeholder="可选描述"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button 
                onClick={handleUpload}
                disabled={!newDoc.name}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上传
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Panel */}
      {showSearchPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="font-semibold text-gray-900">搜索结果</h3>
                <p className="text-sm text-gray-500">"{searchQuery}" 的结果</p>
              </div>
              <button onClick={() => setShowSearchPanel(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">{result.source}</span>
                    <span className="text-xs text-gray-400">相似度: {Math.round(result.score * 100)}%</span>
                  </div>
                  <p className="text-sm text-gray-700">{result.content}</p>
                </div>
              ))}
              
              {searchResults.length === 0 && (
                <p className="text-center text-gray-500 py-8">未找到相关结果</p>
              )}
            </div>

            <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowSearchPanel(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">{selectedDoc.name}</h3>
              <button onClick={() => setSelectedDoc(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">大小</p>
                  <p className="text-sm font-medium text-gray-900">{selectedDoc.size}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">索引片段</p>
                  <p className="text-sm font-medium text-gray-900">{selectedDoc.chunks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">更新时间</p>
                  <p className="text-sm font-medium text-gray-900">{selectedDoc.updatedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">状态</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusConfig[selectedDoc.status].class}`}>
                    {statusConfig[selectedDoc.status].label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => handleDelete(selectedDoc.id)}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                删除
              </button>
              <button 
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
