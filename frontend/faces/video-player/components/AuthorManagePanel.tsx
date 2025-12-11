"use client";

import React from "react";
import { X } from "lucide-react";

interface AuthorManagePanelProps {
  onClose: () => void;
}

export default function AuthorManagePanel({ onClose }: AuthorManagePanelProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">作者管理</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="text-gray-600">
          作者管理功能正在开发中...
        </div>
      </div>
    </div>
  );
}
