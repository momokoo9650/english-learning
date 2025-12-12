/**
 * 首页视频列表组件 - iOS 26 Liquid Glass 风格
 * 功能：分页 + 序号 + 多维度筛选（标题、作者、分类、发音、难度）
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

// 视频时长组件 - 读取真实视频时长
function VideoDuration({ videoUrl }: { videoUrl: string }) {
  const [duration, setDuration] = useState<string>('--:--');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoUrl) {
      setDuration('--:--');
      return;
    }

    const video = document.createElement('video');
    video.src = videoUrl;
    video.preload = 'metadata';
    
    const handleLoadedMetadata = () => {
      const totalSeconds = Math.floor(video.duration);
      if (isFinite(totalSeconds)) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setDuration('--:--');
      }
    };

    const handleError = () => {
      setDuration('--:--');
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      video.src = '';
    };
  }, [videoUrl]);

  return <span>{duration}</span>;
}

interface VideoContent {
  id: string;
  title: string;
  author: string;
  category: string;
  difficulty: string;
  pronunciation: string;
  imageUrl: string;
  videoUrl: string;
  visible: boolean;
  order: number;
  categories?: string[]; // 多分类支持
}

interface CheckInRecord {
  videoId: string;
  userId: string;
  timestamp: string;
}

interface VideoListViewProps {
  contents: VideoContent[];
  onSelectVideo: (content: VideoContent) => void;
  onEditVideo: (content: VideoContent) => void;
  authors: Array<{ id: string; name: string; avatar: string; order: number }>;
  checkInRecords: CheckInRecord[];
  currentUserId?: string;
}

const ITEMS_PER_PAGE = 24;

// 分类颜色生成器 - 为不同分类分配不同颜色
const getCategoryColor = (category: string, index: number) => {
  const colors = [
    '#FFFBB8', // 淡黄色
    '#FFE6F4', // 淡粉色
    '#CFEBFF', // 淡蓝色
    '#E6FFD9', // 淡绿色
  ];
  
  // 使用分类名称的哈希值来确定颜色，这样同一分类始终显示相同颜色
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

export default function VideoListView({
  contents,
  onSelectVideo,
  onEditVideo,
  authors,
  checkInRecords,
  currentUserId
}: VideoListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 检查视频是否已完成
  const isVideoCompleted = (videoId: string): boolean => {
    if (!currentUserId) return false;
    return checkInRecords.some(
      record => record.videoId === videoId && record.userId === currentUserId
    );
  };
  
  // 筛选条件
  const [searchTitle, setSearchTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPronunciation, setFilterPronunciation] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const visibleContents = contents.filter(c => c.visible !== false);

  const uniqueAuthors = useMemo(() => {
    const authors = Array.from(new Set(visibleContents.map(c => c.author)));
    return authors.filter(Boolean).sort();
  }, [visibleContents]);

  const uniqueCategories = useMemo(() => {
    const allCategories = new Set<string>();
    visibleContents.forEach(c => {
      if (c.categories && c.categories.length > 0) {
        c.categories.forEach(cat => allCategories.add(cat));
      } else if (c.category) {
        allCategories.add(c.category);
      }
    });
    return Array.from(allCategories).filter(Boolean).sort();
  }, [visibleContents]);

  const uniquePronunciations = useMemo(() => {
    const pronunciations = Array.from(new Set(visibleContents.map(c => c.pronunciation)));
    return pronunciations.filter(Boolean).sort();
  }, [visibleContents]);

  const uniqueDifficulties = useMemo(() => {
    const difficulties = Array.from(new Set(visibleContents.map(c => c.difficulty)));
    return difficulties.filter(Boolean).sort();
  }, [visibleContents]);

  const filteredContents = useMemo(() => {
    return visibleContents.filter(item => {
      const matchTitle = searchTitle === '' || 
        item.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchAuthor = filterAuthor === 'all' || item.author === filterAuthor;
      
      // 支持多分类筛选
      const matchCategory = filterCategory === 'all' || 
        (item.categories && item.categories.includes(filterCategory)) ||
        item.category === filterCategory;
      
      const matchPronunciation = filterPronunciation === 'all' || item.pronunciation === filterPronunciation;
      const matchDifficulty = filterDifficulty === 'all' || item.difficulty === filterDifficulty;
      
      return matchTitle && matchAuthor && matchCategory && matchPronunciation && matchDifficulty;
    });
  }, [visibleContents, searchTitle, filterAuthor, filterCategory, filterPronunciation, filterDifficulty]);

  const sortedContents = useMemo(() => {
    return [...filteredContents].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [filteredContents]);

  const totalPages = Math.ceil(sortedContents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = sortedContents.slice(startIndex, endIndex);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (value: string) => {
      setter(value);
      setCurrentPage(1);
    };
  };

  const handleClearFilters = () => {
    setSearchTitle('');
    setFilterAuthor('all');
    setFilterCategory('all');
    setFilterPronunciation('all');
    setFilterDifficulty('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTitle || filterAuthor !== 'all' || filterCategory !== 'all' || 
    filterPronunciation !== 'all' || filterDifficulty !== 'all';

  return (
    <div className="space-y-6">
      {/* 筛选区 - YouTube 扁平风格 */}
      <div className="space-y-3">
        {/* 第一行：搜索框 + 分类 + 发音 + 难度 */}
        <div className="flex items-center gap-3">
          {/* 搜索框 - 缩减为一半宽度 */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTitle}
                onChange={(e) => handleFilterChange(setSearchTitle)(e.target.value)}
                placeholder="搜索视频..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* 分类筛选 */}
          <select
            value={filterCategory}
            onChange={(e) => handleFilterChange(setFilterCategory)(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">全部分类</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* 发音筛选 */}
          <select
            value={filterPronunciation}
            onChange={(e) => handleFilterChange(setFilterPronunciation)(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">全部发音</option>
            {uniquePronunciations.map(pronunciation => (
              <option key={pronunciation} value={pronunciation}>{pronunciation}</option>
            ))}
          </select>

          {/* 难度筛选 */}
          <select
            value={filterDifficulty}
            onChange={(e) => handleFilterChange(setFilterDifficulty)(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-full text-sm bg-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="all">全部难度</option>
            {uniqueDifficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>

          {/* 清空按钮 */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1.5 px-4 py-2 hover:bg-gray-100 rounded-full transition text-sm text-gray-700"
            >
              <Icon name="x" size={16} />
              清空
            </button>
          )}
        </div>

        {/* 第二行：作者筛选（头像 + 名称标签） */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleFilterChange(setFilterAuthor)('all')}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-sm font-medium transition ${
              filterAuthor === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {/* 统一大小的圆形图片 */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
              filterAuthor === 'all' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              <img
                src="/placeholder.svg"
                alt="全部作者"
                className="w-full h-full object-cover"
              />
            </div>
            <span>全部作者</span>
            <span className={`text-xs ${
              filterAuthor === 'all' ? 'text-white/70' : 'text-gray-500'
            }`}>
              共{visibleContents.length}期
            </span>
          </button>
          {authors
            .sort((a, b) => a.order - b.order)
            .map(author => {
              const authorVideoCount = visibleContents.filter(v => v.author === author.name).length;
              
              return (
                <button
                  key={author.id}
                  onClick={() => handleFilterChange(setFilterAuthor)(author.name)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-sm font-medium transition ${
                    filterAuthor === author.name
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {/* 放大2倍的圆形头像 */}
                  {author.avatar ? (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex-shrink-0" />
                  )}
                  <span>{author.name}</span>
                  <span className={`text-xs ${
                    filterAuthor === author.name ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    共{authorVideoCount}期
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* 视频卡片网格 */}
      {currentItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentItems.map((item, index) => {
              const globalIndex = startIndex + index;
              const categories = item.categories && item.categories.length > 0 
                ? item.categories 
                : item.category ? [item.category] : [];
              
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectVideo(item)}
                  className="cursor-pointer group"
                >
                  {/* 缩略图区域 - 固定4:3比例 */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* 左下角时长标签 */}
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-semibold text-white" style={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    }}>
                      <VideoDuration videoUrl={item.videoUrl} />
                    </div>

                    {/* 右上角难度星星 - 固定3个星星，缩小+加背景 */}
                    <div className="absolute top-2 right-2 flex gap-0.5 px-1.5 py-1 rounded" style={{
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    }}>
                      {[1, 2, 3].map((star) => {
                        const difficultyLevel = 
                          item.difficulty === '简单' ? 1 :
                          item.difficulty === '中等' ? 2 : 3;
                        const isLit = star <= difficultyLevel;
                        
                        return (
                          <span key={star} className="text-xs" style={{
                            filter: isLit ? 'none' : 'brightness(0.3)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                          }}>
                            {isLit ? '⭐️' : '⭐️'}
                          </span>
                        );
                      })}
                    </div>

                    {/* 左上角已完成标记 */}
                    {isVideoCompleted(item.id) && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg" style={{
                        background: 'rgba(34, 197, 94, 0.9)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                      }}>
                        <Icon name="check-circle" size={14} className="text-white" />
                        <span className="text-xs font-semibold text-white">已完成</span>
                      </div>
                    )}
                  </div>

                  {/* 视频信息区域 - 无背景 */}
                  <div className="space-y-1">
                    {/* 标题 + 发音标签 */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
                        {item.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium text-gray-600 bg-gray-100 flex-shrink-0">
                        {item.pronunciation}
                      </span>
                    </div>
                    
                    {/* 作者 - 灰色字 */}
                    <p className="text-xs text-gray-500">
                      {item.author}
                    </p>
                    
                    {/* 分类标签 */}
                    {categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {categories.map((cat, idx) => {
                          const color = getCategoryColor(cat, idx);
                          return (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded text-xs font-medium text-gray-600"
                              style={{
                                backgroundColor: color
                              }}
                            >
                              {cat}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 分页控件 - YouTube 简约风格 */}
          {sortedContents.length > 0 && (
            <div className="flex items-center justify-center gap-2 py-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-full transition ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon name="chevron-left" size={20} />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (currentPage <= 4) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[40px] h-10 px-3 rounded-full text-sm font-medium transition ${
                        currentPage === pageNum
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full transition ${
                  currentPage === totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon name="chevron-right" size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 glass-card">
          <Icon name="inbox" size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">
            {hasActiveFilters ? '没有找到匹配的语料' : '还没有语料'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 btn-gradient text-white rounded-2xl font-semibold"
            >
              清空筛选条件
            </button>
          ) : (
            <p className="text-sm text-gray-400">请前往「管理语料」创建第一条语料</p>
          )}
        </div>
      )}
    </div>
  );
}