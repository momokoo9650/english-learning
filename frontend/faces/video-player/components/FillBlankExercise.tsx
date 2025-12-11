"use client";

import React, { useState, useEffect } from "react";
import { Check, X, RefreshCw } from "lucide-react";

interface Keyword {
  word: string;
  exampleSentence: string;
}

interface FillBlankExerciseProps {
  keywords: Keyword[];
}

export default function FillBlankExercise({ keywords }: FillBlankExerciseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const keyword = keywords[currentIndex];

  const checkAnswer = () => {
    const correct =
      userAnswer.trim().toLowerCase() === keyword.word.toLowerCase();
    setIsCorrect(correct);
    setShowResult(true);
  };

  const nextQuestion = () => {
    setUserAnswer("");
    setShowResult(false);
    setCurrentIndex((currentIndex + 1) % keywords.length);
  };

  if (!keyword) return null;

  const sentenceWithBlank = keyword.exampleSentence.replace(
    new RegExp(keyword.word, "gi"),
    "______"
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2">
          题目 {currentIndex + 1} / {keywords.length}
        </div>
        <div className="text-lg text-gray-800 mb-4">{sentenceWithBlank}</div>

        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !showResult && checkAnswer()}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="输入答案"
          disabled={showResult}
        />
      </div>

      {showResult && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            isCorrect ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <Check className="text-green-600" size={20} />
                <span className="text-green-800 font-medium">正确！</span>
              </>
            ) : (
              <>
                <X className="text-red-600" size={20} />
                <span className="text-red-800 font-medium">
                  正确答案：{keyword.word}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {!showResult ? (
          <button
            onClick={checkAnswer}
            disabled={!userAnswer.trim()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            检查答案
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={20} />
            下一题
          </button>
        )}
      </div>
    </div>
  );
}
