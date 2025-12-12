/**
 * 认证上下文
 * 管理用户登录状态和权限
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// 用户角色定义
export type UserRole = 'admin' | 'student';

// 用户接口
export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
  email: string;
  createdAt: string;
  lastLogin?: string;
  active: boolean;
  expiresAt?: string; // 账号有效期截止时间（ISO 8601 格式，北京时区）
}

// 权限定义
export interface Permissions {
  canManageContent: boolean;      // 管理语料
  canManageAccounts: boolean;     // 管理账户
  canManageRoles: boolean;        // 管理角色
  canManageAI: boolean;           // 管理 AI 配置
  canViewContent: boolean;        // 查看语料
}

// 认证上下文类型
export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  permissions: Permissions;
  token: string | null; // JWT token（如果需要后端API验证时使用）
  login: (username: string, password: string) => Promise<boolean | string>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 根据角色获取权限
const getRolePermissions = (role: UserRole): Permissions => {
  switch (role) {
    case 'admin':
      return {
        canManageContent: true,
        canManageAccounts: true,
        canManageRoles: true,
        canManageAI: true,
        canViewContent: true
      };
    case 'student':
      return {
        canManageContent: false,
        canManageAccounts: false,
        canManageRoles: false,
        canManageAI: false,
        canViewContent: true
      };
    default:
      return {
        canManageContent: false,
        canManageAccounts: false,
        canManageRoles: false,
        canManageAI: false,
        canViewContent: false
      };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：检查登录状态
  useEffect(() => {
    const initAuth = () => {
      // 检查是否有记住的登录状态
      const savedAuth = localStorage.getItem('auth_session');
      const savedToken = localStorage.getItem('auth_token');
      
      if (savedAuth) {
        try {
          const { userId, expiresAt } = JSON.parse(savedAuth);
          
          // 检查 session 是否过期（1天）
          if (new Date().getTime() < expiresAt) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find((u: User) => u.id === userId && u.active);
            
            if (user) {
              // ⚠️ 关键修复：检查账号是否过期
              if (user.expiresAt) {
                const now = new Date();
                const accountExpiresDate = new Date(user.expiresAt);
                
                if (now > accountExpiresDate) {
                  // 账号已过期，清除 session
                  console.log('⚠️ 账号已过期，自动登出');
                  localStorage.removeItem('auth_session');
                  localStorage.removeItem('auth_token');
                  setIsLoading(false);
                  return;
                }
              }
              
              // session 有效且账号未过期
              setCurrentUser(user);
              setToken(savedToken);
              // 更新最后登录时间
              updateLastLogin(userId);
            } else {
              // 用户不存在或已禁用，清除会话
              localStorage.removeItem('auth_session');
              localStorage.removeItem('auth_token');
            }
          } else {
            // session 过期
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('恢复登录状态失败:', error);
          localStorage.removeItem('auth_session');
          localStorage.removeItem('auth_token');
        }
      }
      
      // 初始化默认管理员账户
      initDefaultAdmin();
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 初始化默认管理员账户
  const initDefaultAdmin = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 检查是否已有管理员账户
    const hasAdmin = users.some((u: User) => u.role === 'admin');
    
    if (!hasAdmin) {
      const defaultAdmin: User = {
        id: `user-${Date.now()}`,
        username: 'admin',
        password: 'admin123', // 生产环境应该加密
        role: 'admin',
        displayName: '系统管理员',
        email: 'admin@example.com',
        createdAt: new Date().toISOString(),
        active: true
      };
      
      users.push(defaultAdmin);
      localStorage.setItem('users', JSON.stringify(users));
      console.log('✅ 默认管理员账户已创建: admin / admin123');
    }
  };

  // 更新最后登录时间
  const updateLastLogin = (userId: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map((u: User) =>
      u.id === userId ? { ...u, lastLogin: new Date().toISOString() } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // 登录
  const login = async (username: string, password: string): Promise<boolean | string> => {
    // 🔧 直接使用本地验证模式（跳过后端 API）
    try {
      console.log('🔐 使用本地验证模式登录...');
      
      // 从本地存储读取用户数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.username === username && u.active);

      if (!user || user.password !== password) {
        console.log('❌ 用户名或密码错误');
        return false; // 用户名或密码错误
      }

      // 检查账号是否过期
      if (user.expiresAt) {
        const now = new Date();
        const expiresDate = new Date(user.expiresAt);
        
        if (now > expiresDate) {
          console.log('⚠️ 账号已过期');
          return 'expired'; // 账号已过期
        }
      }

      // 登录成功
      setCurrentUser(user);
      
      // 生成一个简单的 token（本地模式下只是一个标识）
      const localToken = `local_${user.id}_${Date.now()}`;
      setToken(localToken);
      
      // 保存登录状态（1天有效期）
      const session = {
        userId: user.id,
        expiresAt: new Date().getTime() + 1 * 24 * 60 * 60 * 1000
      };
      localStorage.setItem('auth_session', JSON.stringify(session));
      localStorage.setItem('auth_token', localToken);
      
      // 更新最后登录时间
      updateLastLogin(user.id);
      
      console.log('✅ 本地验证登录成功');
      return true;
      
    } catch (error) {
      console.error('❌ 登录失败:', error);
      return false;
    }
  };

  // 登出
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_token');
  };

  // 计算权限
  const permissions = currentUser
    ? getRolePermissions(currentUser.role)
    : {
        canManageContent: false,
        canManageAccounts: false,
        canManageRoles: false,
        canManageAI: false,
        canViewContent: false
      };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        permissions,
        token,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook 使用认证上下文
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}