"use client";

import React, { useState, useEffect } from 'react';
import './face.css';
import { AuthProvider, useAuth } from './components/AuthContext';
import VideoListView from './components/VideoListView';
import VideoManageView from './components/VideoManageView';
import KeywordManager from './components/KeywordManager';
import KeywordLargeCard from './components/KeywordLargeCard';
import KeywordSmallCard from './components/KeywordSmallCard';
import FillBlankExercise from './components/FillBlankExercise';
import LoginPanel from './components/LoginPanel';
import AccountManagePanel from './components/AccountManagePanel';
import AuthorManagePanel from './components/AuthorManagePanel';
import AIConfigPanel from './components/AIConfigPanel';
import BackupPanel from './components/BackupPanel';
import { User, Video, Settings, Database, Upload, UserCircle, BookOpen, CreditCard } from 'lucide-react';

// ==================== 类型定义 ====================

interface VideoContent {
  _id: string;
  videoId: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  subtitles: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  keywords?: Array<{
    word: string;
    translation: string;
    pronunciation: string;
    exampleSentence: string;
    exampleTranslation: string;
    wordType: string;
    difficulty: string;
    usageScenario: string;
    synonyms: string;
    antonyms: string;
    rootAffix: string;
    memoryTip: string;
  }>;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

interface CheckInRecord {
  _id: string;
  userId: string;
  videoId: string;
  currentStep: number;
  completedSteps: number[];
  createdAt: string;
  updatedAt: string;
}

// ==================== 主组件内容 ====================

function VideoPlayerContent() {
  const { currentUser, logout } = useAuth();
  
  // 视图状态
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'manage' | 'account' | 'author' | 'ai' | 'backup'>('list');
  
  // 数据状态
  const [contents, setContents] = useState<VideoContent[]>([]);
  const [authors, setAuthors] = useState<Array<{ id: string; name: string; avatar: string; order: number }>>([]);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([]);
  const [selectedContent, setSelectedContent] = useState<VideoContent | null>(null);
  
  // 学习状态
  const [learningStep, setLearningStep] = useState(1);
  const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

  // ==================== 数据加载 ====================

  // 加载视频列表
  useEffect(() => {
    if (currentUser) {
      fetchContents();
      fetchAuthors();
      fetchCheckInRecords();
    }
  }, [currentUser]);

  const fetchContents = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      }
    } catch (error) {
      console.error('加载视频列表失败:', error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/authors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthors(data);
      }
    } catch (error) {
      console.error('加载作者列表失败:', error);
    }
  };

  const fetchCheckInRecords = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/checkins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCheckInRecords(data);
      }
    } catch (error) {
      console.error('加载打卡记录失败:', error);
    }
  };

  // ==================== 未登录状态 ====================

  if (!currentUser) {
    return <LoginPanel />;
  }

  // ==================== 顶部导航栏 ====================

  const renderTopBar = () => (
    <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 和标题 */}
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">EchoTube</h1>
          </div>

          {/* 导航菜单 */}
          <div className="flex items-center gap-2">
            {/* 学习 */}
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              学习
            </button>

            {/* 管理员功能 */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setViewMode('manage')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'manage'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Video className="w-5 h-5 inline mr-1" />
                  语料管理
                </button>

                <button
                  onClick={() => setViewMode('author')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'author'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserCircle className="w-5 h-5 inline mr-1" />
                  作者管理
                </button>

                <button
                  onClick={() => setViewMode('account')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'account'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5 inline mr-1" />
                  账户管理
                </button>

                <button
                  onClick={() => setViewMode('ai')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'ai'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5 inline mr-1" />
                  AI 配置
                </button>

                <button
                  onClick={() => setViewMode('backup')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === 'backup'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Database className="w-5 h-5 inline mr-1" />
                  备份
                </button>
              </>
            )}


             {/* 用户信息 */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Icon name="user" size={16} className="text-gray-600" />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{currentUser.username}</div>
                  {currentUser.expiresAt && (
                    <div className="text-xs text-gray-500">
                      有效期至: {new Date(currentUser.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentUser?.role === 'admin'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {currentUser?.role === 'admin' ? '管理员' : '学生'}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== 主内容区域 ====================

  return (
    <div className="min-h-screen bg-gray-50">
      {renderTopBar()}
      
      <div className="pt-16">
        {/* 视频列表视图 */}
        {viewMode === 'list' && (
          <VideoListView
            contents={contents}
            onSelectVideo={(content) => {
              setSelectedContent(content);
              setViewMode('detail');
              setLearningStep(1);
            }}
            onEditVideo={(content) => {
              setSelectedContent(content);
              setViewMode('manage');
            }}
            authors={authors}
            checkInRecords={checkInRecords}
            currentUserId={currentUser?.id}
          />
        )}

        {/* 视频详情学习视图 */}
        {viewMode === 'detail' && selectedContent && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 返回按钮 */}
            <button
              onClick={() => setViewMode('list')}
              className="mb-6 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← 返回列表
            </button>

            {/* 学习步骤选择器 */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {[
                { step: 1, label: '观看视频' },
                { step: 2, label: '关键词卡片（大）' },
                { step: 3, label: '关键词卡片（小）' },
                { step: 4, label: '填空练习' },
                { step: 5, label: '跟读练习' }
              ].map(({ step, label }) => (
                <button
                  key={step}
                  onClick={() => setLearningStep(step)}
                  className={`px-6 py-3 rounded-lg whitespace-nowrap transition-all ${
                    learningStep === step
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  步骤 {step}: {label}
                </button>
              ))}
            </div>

            {/* 学习内容 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* 步骤 1: 观看视频 */}
              {learningStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedContent.title}</h2>
                  
                  {/* YouTube 视频播放器 */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedContent.videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* 字幕列表 */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">字幕</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedContent.subtitles?.map((subtitle, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-sm text-gray-500 mb-1">
                            {Math.floor(subtitle.start / 60)}:{(subtitle.start % 60).toString().padStart(2, '0')} - {Math.floor(subtitle.end / 60)}:{(subtitle.end % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-gray-900">{subtitle.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤 2: 关键词大卡片 */}
              {learningStep === 2 && (
                <KeywordLargeCard
                  keywords={selectedContent.keywords || []}
                  onComplete={() => setLearningStep(3)}
                />
              )}

              {/* 步骤 3: 关键词小卡片 */}
              {learningStep === 3 && (
                <KeywordSmallCard
                  keywords={selectedContent.keywords || []}
                  onComplete={() => setLearningStep(4)}
                />
              )}

              {/* 步骤 4: 填空练习 */}
              {learningStep === 4 && (
                <FillBlankExercise
                  keywords={selectedContent.keywords || []}
                  onComplete={() => setLearningStep(5)}
                />
              )}

              {/* 步骤 5: 跟读练习 */}
              {learningStep === 5 && (
                <div className="text-center py-12">
                  <h3 className="text-2xl font-bold mb-4">跟读练习</h3>
                  <p className="text-gray-600 mb-8">请跟随视频中的发音进行练习</p>
                  
                  {/* YouTube 视频播放器 */}
                  <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                    <iframe
                      src={`https://www.youtube.com/embed/${selectedContent.videoId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  <button
                    onClick={async () => {
                      // 记录打卡
                      try {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                        const token = localStorage.getItem('token');
                        
                        await fetch(`${API_URL}/api/checkins`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            videoId: selectedContent._id,
                            currentStep: 5,
                            completedSteps: [1, 2, 3, 4, 5]
                          })
                        });

                        alert('恭喜完成学习！');
                        setViewMode('list');
                      } catch (error) {
                        console.error('打卡失败:', error);
                      }
                    }}
                    className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    完成学习
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 语料管理视图 */}
        {viewMode === 'manage' && (
          <VideoManageView
            initialContent={selectedContent}
            authors={authors}
            onBack={() => {
              setViewMode('list');
              setSelectedContent(null);
              fetchContents();
            }}
          />
        )}

        {/* 账户管理视图 */}
        {viewMode === 'account' && <AccountManagePanel />}

        {/* 作者管理视图 */}
        {viewMode === 'author' && (
          <AuthorManagePanel
            onAuthorsChange={() => fetchAuthors()}
          />
        )}

        {/* AI 配置视图 */}
        {viewMode === 'ai' && <AIConfigPanel />}

        {/* 备份视图 */}
        {viewMode === 'backup' && <BackupPanel />}
      </div>
    </div>
  );
}

// ==================== 主组件包装器 ====================

export default function VideoPlayerFace() {
  return (
    <AuthProvider>
      <div className="video-player-container min-h-screen bg-background">
        <VideoPlayerContent />
      </div>
    </AuthProvider>
  );
}

