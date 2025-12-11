"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 用户类型
interface User {
  id: string;
  username: string;
  role: "admin" | "student";
  expiryDate?: string;
}

// 权限定义
interface Permissions {
  canManageVideos: boolean;
  canManageAccounts: boolean;
  canManageAuthors: boolean;
  canConfigureAI: boolean;
  canBackup: boolean;
}

// 认证上下文类型
export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  permissions: Permissions;
  login: (username: string, password: string) => Promise<boolean | string>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // 计算权限
  const permissions: Permissions = {
    canManageVideos: currentUser?.role === "admin",
    canManageAccounts: currentUser?.role === "admin",
    canManageAuthors: currentUser?.role === "admin",
    canConfigureAI: currentUser?.role === "admin",
    canBackup: currentUser?.role === "admin",
  };

  // 初始化时从 localStorage 恢复用户状态
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("currentUser");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // 检查账户是否过期
        if (user.expiryDate && new Date(user.expiryDate) < new Date()) {
          console.log("账户已过期");
          logout();
        } else {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("解析用户信息失败:", error);
        logout();
      }
    }
    
    setIsLoading(false);
  }, []);

  // 登录函数
  const login = async (username: string, password: string): Promise<boolean | string> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return data.message || "登录失败";
      }

      // 保存 token 和用户信息
      localStorage.setItem("token", data.token);
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      setCurrentUser(data.user);

      return true;
    } catch (error) {
      console.error("登录错误:", error);
      return "网络错误，请检查后端服务是否启动";
    }
  };

  // 登出函数
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        permissions,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定义 Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}