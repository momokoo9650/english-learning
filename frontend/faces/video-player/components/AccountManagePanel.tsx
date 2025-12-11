"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Edit } from "lucide-react";
import { useAuth } from "./AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface User {
  _id: string;
  username: string;
  role: string;
  expiryDate?: Date;
  createdAt: Date;
}

interface AccountManagePanelProps {
  onClose: () => void;
}

export default function AccountManagePanel({ onClose }: AccountManagePanelProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
    expiryDate: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("创建成功");
        setShowForm(false);
        setFormData({ username: "", password: "", role: "user", expiryDate: "" });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "创建失败");
      }
    } catch (error) {
      console.error("创建失败:", error);
      alert("创建失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个账户吗？")) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("删除成功");
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      alert("删除失败");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">账户管理</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            创建账户
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="用户名"
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="密码"
                  className="px-4 py-2 border rounded-lg"
                  required
                />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="user">普通用户</option>
                  <option value="author">作者</option>
                  <option value="admin">管理员</option>
                </select>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                  placeholder="有效期"
                  className="px-4 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建
              </button>
            </form>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-600">
                    {user.role} | 创建于 {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  {user.expiryDate && (
                    <div className="text-sm text-gray-600">
                      有效期至 {new Date(user.expiryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
