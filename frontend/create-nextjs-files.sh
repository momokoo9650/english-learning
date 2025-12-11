#!/bin/bash

echo "🔧 开始生成 Next.js 必需的配置文件..."
echo ""

# 1. 创建 app/layout.tsx
echo "📝 创建 app/layout.tsx..."
mkdir -p app
cat > app/layout.tsx <<'EOF'
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EchoTube - 英语学习平台",
  description: "基于视频的英语学习平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
EOF

# 2. 创建 app/globals.css
echo "📝 创建 app/globals.css..."
cat > app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
EOF

# 3. 创建 tsconfig.json
echo "📝 创建 tsconfig.json..."
cat > tsconfig.json <<'EOF'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# 4. 创建 tailwind.config.js
echo "📝 创建 tailwind.config.js..."
cat > tailwind.config.js <<'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './faces/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
EOF

# 5. 创建 postcss.config.js
echo "📝 创建 postcss.config.js..."
cat > postcss.config.js <<'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 6. 创建 next.config.js
echo "📝 创建 next.config.js..."
cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
EOF

# 7. 创建 .env.production
echo "📝 创建 .env.production..."
cat > .env.production <<'EOF'
NEXT_PUBLIC_API_URL=http://47.114.117.255:3001
EOF

# 8. 创建或更新 .gitignore
echo "📝 创建/更新 .gitignore..."
cat > .gitignore <<'EOF'
# 依赖
node_modules/
package-lock.json
yarn.lock

# Next.js
.next/
out/

# 环境变量
.env
.env.local
.env.*.local
!.env.example
!.env.*.example

# 日志
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 系统文件
.DS_Store
*.pem

# 备份
*.backup
*.bak

# IDE
.vscode/
.idea/
*.swp
*.swo

# 测试
coverage/
.nyc_output/
EOF

# 9. 显示结果
echo ""
echo "=========================================="
echo "  ✅ 文件生成完成！"
echo "=========================================="
echo ""
echo "📁 已创建的文件："
echo ""
ls -lh app/layout.tsx 2>/dev/null && echo "  ✅ app/layout.tsx"
ls -lh app/globals.css 2>/dev/null && echo "  ✅ app/globals.css"
ls -lh tsconfig.json 2>/dev/null && echo "  ✅ tsconfig.json"
ls -lh tailwind.config.js 2>/dev/null && echo "  ✅ tailwind.config.js"
ls -lh postcss.config.js 2>/dev/null && echo "  ✅ postcss.config.js"
ls -lh next.config.js 2>/dev/null && echo "  ✅ next.config.js"
ls -lh .env.production 2>/dev/null && echo "  ✅ .env.production"
ls -lh .gitignore 2>/dev/null && echo "  ✅ .gitignore"
echo ""
echo "=========================================="
echo "  📋 下一步操作："
echo "=========================================="
echo ""
echo "1️⃣  提交到 Git："
echo "    git add ."
echo "    git status"
echo "    git commit -m \"添加 Next.js 必需的配置文件\""
echo "    git push"
echo ""
echo "2️⃣  在服务器上更新："
echo "    ssh root@47.114.117.255"
echo "    cd /var/www/english-learning/project/frontend"
echo "    git pull"
echo "    npm install"
echo "    npm run build"
echo "    pm2 restart english-learning-frontend"
echo ""
