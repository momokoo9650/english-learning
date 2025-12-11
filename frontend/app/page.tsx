"use client";

import dynamic from "next/dynamic";

const VideoPlayerFace = dynamic(
  () => import("@/faces/video-player/face"),
  { ssr: false }
);

export default function Page() {
  return <VideoPlayerFace />;
}