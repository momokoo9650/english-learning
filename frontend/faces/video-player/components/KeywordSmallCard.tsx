"use client";

import React from "react";
import { Volume2 } from "lucide-react";

interface Keyword {
  word: string;
  translation: string;
  phonetic: string;
}

interface KeywordSmallCardProps {
  keyword: Keyword;
  isActive: boolean;
  onClick: () => void;
}

export default function KeywordSmallCard({
  keyword,
  isActive,
  onClick,
}: KeywordSmallCardProps) {
  const playPronunciation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(keyword.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-800">{keyword.word}</div>
        <button
          onClick={playPronunciation}
          className="p-1 rounded-full hover:bg-blue-100 text-blue-600"
        >
          <Volume2 size={16} />
        </button>
      </div>
      <div className="text-sm text-gray-600">{keyword.phonetic}</div>
      <div className="text-sm text-gray-700 mt-1">{keyword.translation}</div>
    </div>
  );
}
