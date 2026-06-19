"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SUGGESTIONS = [
  "我的八字整体格局如何？",
  "今日财运怎么样？",
  "2026年流年运势",
  "感情方面如何？",
  "事业适合什么方向？",
];

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (text: string) => {
    onSend(text);
    setInput("");
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-3">
      {showSuggestions && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 hover:text-zinc-200 hover:border-purple-500/40 hover:bg-zinc-800 transition-all whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-2 focus-within:border-purple-500/50 transition-colors">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "输入你的问题..."}
          disabled={disabled}
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none bg-transparent border-0 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="shrink-0 h-10 w-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-30"
        >
          {disabled ? (
            <Sparkles className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}