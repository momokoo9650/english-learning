"use client";

import React, { useState, useEffect } from "react";
import { Play, Edit, Trash2, Plus, Upload } from "lucide-react";

export interface VideoContent {
  _id?: string;
  id: string;
  title: string;
  videoUrl: string;
  subtitleFile?: string;
  subtitles?: Array<{
    start: number;
    end: number;
    text: string;
    translation?: string;
  }>;
  keywords?: Array<{
    word: string;
    phonetic?: string;
    partOfSpeech?: string;
    chineseDefinition?: string;
    englishDefinition?: string;
    examples?: Array<{ en: string; zh: string }>;
    synonyms?: string;
    antonyms?: string;
    usage?: string;
    memoryTip?: string;
  }>;
  checkInRecords?: Array<{
    date: string;
    step: number;
  }>;
}

export interface VideoListViewProps {
  onSelectVideo: (video: VideoContent) => void;
  onEditVideo: (video: VideoContent) => void;
  refreshTrigger?: number;
}

export default function VideoListView({
  onSelectVideo,
  onEditVideo,
  refreshTrigger,
}: VideoListViewProps) {
  const [videos, setVideos] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [refreshTrigger]);

  const handleDelete = async (videoId: string) => {
    if (!confirm("确定要删除这个视频吗？")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Upload className="w-12 h-12 mb-4 opacity-50" />
        <p>还没有视频</p>
        <p className="text-sm">点击右上角「语料管理」添加视频</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <div
          key={video._id || video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Play className="w-16 h-16 text-white opacity-80" />
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
              {video.title}
            </h3>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => onSelectVideo(video)}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                学习
              </button>
              <button
                onClick={() => onEditVideo(video)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(video._id || video.id)}
                className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}