"use client";

import React, { useState } from "react";
import { Volume2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

interface Keyword {
  word: string;
  translation: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  exampleTranslation: string;
  synonyms: string;
  etymology: string;
  imageUrl: string;
}

interface KeywordLargeCardProps {
  keywords: Keyword[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export default function KeywordLargeCard({
  keywords,
  currentIndex,
  onIndexChange,
}: KeywordLargeCardProps) {
  const keyword = keywords[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < keywords.length - 1) {
      onIndexChange(currentIndex + 1);
    }
  };

  const playPronunciation = () => {
    const utterance = new SpeechSynthesisUtterance(keyword.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  if (!keyword) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-blue-600" />
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {keywords.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === keywords.length - 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-3xl font-bold text-gray-800">{keyword.word}</h3>
          <button
            onClick={playPronunciation}
            className="p-2 rounded-full hover:bg-blue-50 text-blue-600"
          >
            <Volume2 size={20} />
          </button>
        </div>
        <div className="text-gray-600">{keyword.phonetic}</div>
        <div className="text-sm text-blue-600 mt-1">{keyword.partOfSpeech}</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">中文释义</div>
          <div className="text-lg text-gray-800">{keyword.translation}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">英文定义</div>
          <div className="text-gray-700">{keyword.definition}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">例句</div>
          <div className="text-gray-700 italic mb-1">{keyword.exampleSentence}</div>
          <div className="text-gray-600">{keyword.exampleTranslation}</div>
        </div>

        {keyword.synonyms && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">同义词</div>
            <div className="text-gray-700">{keyword.synonyms}</div>
          </div>
        )}

        {keyword.etymology && (
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">词源</div>
            <div className="text-gray-700">{keyword.etymology}</div>
          </div>
        )}
      </div>
    </div>
  );
}
