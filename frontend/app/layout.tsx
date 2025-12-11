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
