"use client";

import React, { useState } from "react";
import { Save, Sparkles, X } from "lucide-react";
import { useAuth } from "./AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Keyword {
  word: string;
  translation: string;
  phonetic: string;
  audioUrl: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence: string;
  exampleTranslation: string;
  synonyms: string;
  etymology: string;
  imageUrl: string;
  contextFromVideo: string;
}

interface KeywordManagerProps {
  videoId: string;
  subtitles: string;
  keywords: Keyword[];
  onSave: (keywords: Keyword[]) => void;
  onClose: () => void;
}

export default function KeywordManager({
  videoId,
  subtitles,
  keywords: initialKeywords,
  onSave,
  onClose,
}: KeywordManagerProps) {
  const { token } = useAuth();
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleExtractKeywords = async () => {
    const apiKey = localStorage.getItem("deepseek_api_key");
    if (!apiKey) {
      alert("请先在 AI 配置中设置 DeepSeek API Key");
      return;
    }

    setExtracting(true);
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "从字幕中提取10-15个重要关键词，返回JSON数组格式：[{\"word\":\"单词\",\"translation\":\"中文翻译\"}]",
            },
            { role: "user", content: subtitles },
          ],
        }),
      });

      const data = await response.json();
      const extractedWords = JSON.parse(data.choices[0].message.content);
      
      const newKeywords = extractedWords.map((item: any) => ({
        word: item.word,
        translation: item.translation,
        phonetic: "",
        audioUrl: "",
        partOfSpeech: "",
        definition: "",
        exampleSentence: "",
        exampleTranslation: "",
        synonyms: "",
        etymology: "",
        imageUrl: "",
        contextFromVideo: "",
      }));

      setKeywords(newKeywords);
      alert("提取成功！");
    } catch (error) {
      console.error("提取失败:", error);
      alert("提取失败");
    } finally {
      setExtracting(false);
    }
  };

  const handleGenerateCards = async () => {
    const apiKey = localStorage.getItem("deepseek_api_key");
    if (!apiKey) {
      alert("请先配置 DeepSeek API Key");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "为每个单词生成完整学习卡片信息，返回JSON数组",
            },
            { role: "user", content: JSON.stringify(keywords.map(k => k.word)) },
          ],
        }),
      });

      const data = await response.json();
      const generatedCards = JSON.parse(data.choices[0].message.content);
      setKeywords(generatedCards);
      alert("生成成功！");
    } catch (error) {
      console.error("生成失败:", error);
      alert("生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    onSave(keywords);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">关键词管理</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleExtractKeywords}
              disabled={extracting}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {extracting ? "提取中..." : "AI 提取关键词"}
            </button>

            <button
              onClick={handleGenerateCards}
              disabled={generating || keywords.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {generating ? "生成中..." : "生成学习卡片"}
            </button>
          </div>

          <div className="space-y-4">
            {keywords.map((keyword, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-medium text-lg">{keyword.word}</div>
                <div className="text-gray-600">{keyword.translation}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save size={20} />
            保存
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
