"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { BaziCard, BaziCardSkeleton } from "@/components/BaziCard";
import { ChatMessage, WelcomeMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { toast } from "sonner";
import type { BaziResult, ChatMessage as ChatMessageType } from "@/lib/types";

interface SessionData {
  userId: string;
  archiveId: string | null;
  birthInfo: {
    name: string;
    gender: string;
    birthDate: string;
    birthHour: number;
    birthMinute: number;
    birthPlace?: string;
  };
  baziResult: BaziResult;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 从 sessionStorage 恢复数据
    const stored = sessionStorage.getItem("ai_fate_session");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSession(data);
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    // 自动滚动到底部
    if (scrollRef.current) {
      const el = scrollRef.current;
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [messages, isStreaming]);

  const handleSend = async (content: string) => {
    if (!session || isStreaming) return;

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    try {
      // 构建当前对话历史
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      }));

      // 构建八字上下文
      const bazi = session.baziResult;
      const baziContext = `
【命盘信息】
八字：${bazi.four_pillars}
日主：${bazi.day_master}（${bazi.day_master_wuxing}）
性别：${bazi.gender}
生肖：${bazi.shengxiao}
星座：${bazi.zodiac}
农历：${bazi.lunar_birthday}

年柱：${bazi.year_pillar.heavenly_stem}${bazi.year_pillar.earthly_branch}（纳音${bazi.year_pillar.nayin}，十神${bazi.year_pillar.shishen}）
月柱：${bazi.month_pillar.heavenly_stem}${bazi.month_pillar.earthly_branch}（纳音${bazi.month_pillar.nayin}，十神${bazi.month_pillar.shishen}）
日柱：${bazi.day_pillar.heavenly_stem}${bazi.day_pillar.earthly_branch}（纳音${bazi.day_pillar.nayin}，十神${bazi.day_pillar.shishen}）
时柱：${bazi.hour_pillar.heavenly_stem}${bazi.hour_pillar.earthly_branch}（纳音${bazi.hour_pillar.nayin}，十神${bazi.hour_pillar.shishen}）

五行分布：${Object.entries(bazi.wuxing_distribution).filter(([,c]) => c > 0).map(([wx, count]) => `${wx}${count}`).join(" ")}
`.trim();

      // 获取Agent配置
      let agentConfig = null;
      try {
        const configRes = await fetch("/api/agent-configs");
        if (configRes.ok) {
          const configs = await configRes.json();
          if (configs.length > 0) {
            agentConfig = configs[0];
          }
        }
      } catch {}

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          baziContext,
          agentConfig,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "AI 响应失败");
      }

      if (!res.body) throw new Error("No response body");

      // 处理流式响应
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessageType = {
        id: assistantId,
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim());

        for (const line of lines) {
          if (line.startsWith("0:")) {
            // Vercel AI SDK 文本格式: "0:content"
            const text = line.slice(2).replace(/^"|"$/g, "");
            assistantContent += text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              )
            );
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "AI 响应失败";
      toast.error(errorMessage);
      // 添加错误消息
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `抱歉，${errorMessage}。请检查 API 配置后重试。`,
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="text-zinc-500 animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-medium text-zinc-100">
              {session.birthInfo.name} 的命盘
            </h1>
            <p className="text-[10px] text-zinc-600">
              {session.baziResult.four_pillars}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-600 hover:text-zinc-400"
          onClick={() => {
            sessionStorage.removeItem("ai_fate_session");
            router.push("/");
          }}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          新测算
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 侧边 - 命盘卡片 (桌面) */}
        <div className="hidden md:block w-80 shrink-0 p-4 overflow-y-auto border-r border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-3 font-medium tracking-wider uppercase">
            命盘信息
          </p>
          <BaziCard bazi={session.baziResult} />
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 命盘卡片 (移动端) */}
          <div className="md:hidden px-4 pt-3">
            <BaziCard bazi={session.baziResult} />
          </div>

          {/* 消息区域 */}
          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 && !isStreaming && <WelcomeMessage />}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isStreaming && messages.length > 0 && messages[messages.length - 1].content === "" && (
                <div className="flex gap-3 mb-4">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-amber-600 flex items-center justify-center text-xs">
                    AI
                  </div>
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-zinc-800/60 border border-zinc-700/40">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 输入区域 */}
          <div className="px-4 py-3 border-t border-zinc-800/50 shrink-0">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={handleSend}
                disabled={isStreaming}
                placeholder="输入你想了解的运势问题..."
              />
              <p className="text-[10px] text-zinc-700 text-center mt-2">
                AI 命理分析仅供娱乐参考 · 命运掌握在自己手中
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}