import React, { useState } from 'react';

export default function DeploymentHelper() {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('frontend');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🚀 部署助手
          </h1>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('frontend')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'frontend'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              前端部署
            </button>
            <button
              onClick={() => setActiveTab('backend')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'backend'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              后端部署
            </button>
          </div>

          {activeTab === 'frontend' && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4">
                  📦 前端部署步骤
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li>本地构建：<code className="bg-white px-2 py-1 rounded">npm run build</code></li>
                  <li>上传文件到服务器 <code>/var/www/english-learning/frontend</code></li>
                  <li>服务器安装依赖：<code className="bg-white px-2 py-1 rounded">npm install --production</code></li>
                  <li>启动服务：<code className="bg-white px-2 py-1 rounded">pm2 start npm --name frontend -- start</code></li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  🔧 后端部署步骤
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li>上传后端代码到服务器 <code>/var/www/english-learning/backend</code></li>
                  <li>安装依赖：<code className="bg-white px-2 py-1 rounded">npm install</code></li>
                  <li>配置环境变量：<code className="bg-white px-2 py-1 rounded">.env</code></li>
                  <li>启动服务：<code className="bg-white px-2 py-1 rounded">pm2 start server.js --name backend</code></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
