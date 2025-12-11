"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useAuth } from "./AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Video {
  _id?: string;
  title: string;
  videoId: string;
  videoSource: string;
  subtitles: string;
}

interface VideoManageViewProps {
  video: Video | null;
  onBack: () => void;
  onSave: () => void;
}

export default function VideoManageView({
  video,
  onBack,
  onSave,
}: VideoManageViewProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<Video>({
    title: "",
    videoId: "",
    videoSource: "youtube",
    subtitles: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (video) {
      setFormData(video);
    }
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = video?._id
        ? `${API_URL}/api/videos/${video._id}`
        : `${API_URL}/api/videos`;

      const response = await fetch(url, {
        method: video?._id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(video?._id ? "更新成功" : "创建成功");
        onSave();
      } else {
        const error = await response.json();
        alert(error.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setFormData({ ...formData, subtitles: content });
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} />
        返回列表
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {video?._id ? "编辑视频" : "添加视频"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入视频标题"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频来源
            </label>
            <select
              value={formData.videoSource}
              onChange={(e) =>
                setFormData({ ...formData, videoSource: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="youtube">YouTube</option>
              <option value="bilibili">Bilibili</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              视频 ID
            </label>
            <input
              type="text"
              value={formData.videoId}
              onChange={(e) =>
                setFormData({ ...formData, videoId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                formData.videoSource === "youtube"
                  ? "YouTube 视频 ID（如：dQw4w9WgXcQ）"
                  : "Bilibili BV 号（如：BV1xx411c7mD）"
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              字幕文件
            </label>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".srt,.vtt,.txt"
                onChange={handleFileUpload}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                上传
              </button>
            </div>
            <textarea
              value={formData.subtitles}
              onChange={(e) =>
                setFormData({ ...formData, subtitles: e.target.value })
              }
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              placeholder="或直接粘贴字幕内容"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? "保存中..." : "保存"}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
