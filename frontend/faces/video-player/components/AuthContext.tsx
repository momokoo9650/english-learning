"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 用户类型
interface User {
  id: string;
  username: string;
  displayName: string;
  role: "admin" | "student";
  expiryDate?: string;
}

// 权限定义
interface Permissions {
  canManageContent: boolean;
  canManageAccounts: boolean;
  canManageAuthors: boolean;
  canManageAI: boolean;
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

  // 计算权限
  const permissions: Permissions = {
    canManageContent: currentUser?.role === "admin",
    canManageAccounts: currentUser?.role === "admin",
    canManageAuthors: currentUser?.role === "admin",
    canManageAI: currentUser?.role === "admin",
    canBackup: currentUser?.role === "admin",
  };

  // 初始化时从 localStorage 恢复用户状态
  useEffect(() => {
    const userStr = localStorage.getItem("currentUser");

    if (userStr) {
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
      // 模拟本地验证（实际生产环境应该调用后端 API）
      const defaultAccounts = [
        {
          id: "admin-001",
          username: "admin",
          password: "admin123",
          displayName: "管理员",
          role: "admin" as const
        },
        {
          id: "student-001",
          username: "student",
          password: "student123",
          displayName: "学生",
          role: "student" as const,
          expiryDate: "2025-12-31"
        }
      ];

      const account = defaultAccounts.find(
        acc => acc.username === username && acc.password === password
      );

      if (!account) {
        return "用户名或密码错误";
      }

      // 检查账户是否过期
      if (account.expiryDate && new Date(account.expiryDate) < new Date()) {
        return "账户已过期，请联系管理员";
      }

      const user: User = {
        id: account.id,
        username: account.username,
        displayName: account.displayName,
        role: account.role,
        expiryDate: account.expiryDate
      };

      // 保存用户信息
      localStorage.setItem("currentUser", JSON.stringify(user));
      setCurrentUser(user);

      return true;
    } catch (error) {
      console.error("登录错误:", error);
      return "登录失败，请重试";
    }
  };

  // 登出函数
  const logout = () => {
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
