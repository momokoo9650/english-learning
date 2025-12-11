"use client";

import React from "react";
import { X, Download, Upload } from "lucide-react";
import { useAuth } from "./AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface BackupPanelProps {
  onClose: () => void;
}

export default function BackupPanel({ onClose }: BackupPanelProps) {
  const { token } = useAuth();

  const handleExport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/backup/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error("导出失败:", error);
      alert("导出失败");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const response = await fetch(`${API_URL}/api/backup/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("导入成功");
      } else {
        alert("导入失败");
      }
    } catch (error) {
      console.error("导入失败:", error);
      alert("导入失败");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">备份与恢复</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download size={20} />
            导出所有数据
          </button>

          <label className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
            <Upload size={20} />
            导入数据
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
