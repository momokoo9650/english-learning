"use client";

import React, { useState } from "react";
import { AuthProvider, useAuth } from "../faces/video-player/components/AuthContext";
import LoginPanel from "../faces/video-player/components/LoginPanel";
import VideoListView from "../faces/video-player/components/VideoListView";
import VideoManageView from "../faces/video-player/components/VideoManageView";
import AccountManagePanel from "../faces/video-player/components/AccountManagePanel";
import AIConfigPanel from "../faces/video-player/components/AIConfigPanel";
import BackupPanel from "../faces/video-player/components/BackupPanel";
import { LogOut, Plus, Users, Settings, Database } from "lucide-react";

function MainApp() {
  const { user, logout, isLoading } = useAuth();
  const [view, setView] = useState<"list" | "manage">("list");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showAccountManage, setShowAccountManage] = useState(false);
  const [showAIConfig, setShowAIConfig] = useState(false);
  const [showBackup, setShowBackup] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPanel />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">英语学习平台</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.username} ({user.role})
            </span>

            {(user.role === "admin" || user.role === "author") && (
              <button
                onClick={() => {
                  setSelectedVideo(null);
                  setView("manage");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                语料管理
              </button>
            )}

            {user.role === "admin" && (
              <>
                <button
                  onClick={() => setShowAccountManage(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="账户管理"
                >
                  <Users size={20} />
                </button>
                <button
                  onClick={() => setShowBackup(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="备份与恢复"
                >
                  <Database size={20} />
                </button>
              </>
            )}

            <button
              onClick={() => setShowAIConfig(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="AI 配置"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="退出登录"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === "list" ? (
          <VideoListView
            onSelectVideo={(video) => {
              setSelectedVideo(video);
              setView("manage");
            }}
            onEditVideo={(video) => {
              setSelectedVideo(video);
              setView("manage");
            }}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <VideoManageView
            video={selectedVideo}
            onBack={() => {
              setView("list");
              setSelectedVideo(null);
            }}
            onSave={() => {
              setView("list");
              setSelectedVideo(null);
              setRefreshTrigger(refreshTrigger + 1);
            }}
          />
        )}
      </main>

      {showAccountManage && (
        <AccountManagePanel onClose={() => setShowAccountManage(false)} />
      )}
      {showAIConfig && <AIConfigPanel onClose={() => setShowAIConfig(false)} />}
      {showBackup && <BackupPanel onClose={() => setShowBackup(false)} />}
    </div>
  );
}

export default function VideoPlayer() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
