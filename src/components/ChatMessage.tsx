"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) return null;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} mb-4`}>
      <Avatar className={`h-8 w-8 shrink-0 ${isUser ? "bg-purple-600" : "bg-amber-600"}`}>
        <AvatarFallback className="text-xs">
          {isUser ? "我" : "AI"}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-purple-600/20 border border-purple-500/20 text-zinc-200"
            : "bg-zinc-800/60 border border-zinc-700/40 text-zinc-200"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {isLoading && <span className="typing-cursor" />}
        </div>
      </div>
    </div>
  );
}

export function WelcomeMessage() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 shrink-0 bg-amber-600">
        <AvatarFallback className="text-xs">AI</AvatarFallback>
      </Avatar>
      <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-zinc-800/60 border border-zinc-700/40 text-zinc-200">
        <p className="mb-2 font-medium text-amber-300">命盘已就绪 ✨</p>
        <p className="text-zinc-400">
          我已根据您的出生信息推演出命盘。您可以问我以下问题：
        </p>
        <div className="mt-3 space-y-1.5">
          <p className="text-zinc-500">• 我的八字整体格局如何？</p>
          <p className="text-zinc-500">• 事业财运有什么特征？</p>
          <p className="text-zinc-500">• 感情婚姻方面如何？</p>
          <p className="text-zinc-500">• 当前大运流年运势如何？</p>
        </div>
      </div>
    </div>
  );
}