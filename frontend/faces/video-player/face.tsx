"use client";

import React from 'react';
import './face.css';
import { AuthProvider } from './components/AuthContext';
import VideoListView from './components/VideoListView';

export default function VideoPlayerFace() {
  return (
    <AuthProvider>
      <div className="video-player-container min-h-screen bg-background">
        <VideoListView />
      </div>
    </AuthProvider>
  );
}
