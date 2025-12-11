"use client";

import React, { useState, useEffect } from "react";
import { Play, Trash2, Edit, CheckCircle } from "lucide-react";
import { useAuth } from "./AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Video {
  _id: string;
  title: string;
  videoId: string;
  videoSource: string;
  createdAt: string;
  checkInRecords?: Array<{ date: Date; step: number }>;
}

interface VideoListViewProps {
  onSelectVideo: (video: Video) => void;
  onEditVideo: (video: Video) => void;
  refreshTrigger?: number;
}

export default function VideoListView({
  onSelectVideo,
  onEditVideo,
  refreshTrigger = 0,
}: VideoListViewProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, [token, refreshTrigger]);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error("获取视频列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个视频吗？")) return;

    try {
      const response = await fetch(`${API_URL}/api/videos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("删除成功");
        fetchVideos();
      } else {
        const error = await response.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败");
    }
  };

  const getCheckInDays = (video: Video) => {
    if (!video.checkInRecords || video.checkInRecords.length === 0) return 0;
    const uniqueDates = new Set(
      video.checkInRecords.map((record) =>
        new Date(record.date).toDateString()
      )
    );
    return uniqueDates.size;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        还没有视频，点击「语料管理」添加第一个视频吧！
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div
          key={video._id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
              {video.title}
            </h3>
            <div className="text-sm text-gray-500 mb-4">
              {new Date(video.createdAt).toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
              <CheckCircle size={16} className="text-green-500" />
              <span>已打卡 {getCheckInDays(video)} 天</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSelectVideo(video)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play size={16} />
                学习
              </button>

              <button
                onClick={() => onEditVideo(video)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit size={16} />
              </button>

              {(user?.role === "admin" || user?.role === "author") && (
                <button
                  onClick={() => handleDelete(video._id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
