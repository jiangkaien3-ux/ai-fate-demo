"use client";

import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Trash2, Sparkles, Send, User, Bot } from "lucide-react";
import { BaziCard } from "@/components/BaziCard";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { BaziResult, ChatMessage as ChatMessageType } from "@/lib/types";

// ====== 消息提示组件 (memo优化) ======
const WelcomeMessage = memo(function WelcomeMessage() {
  return (
    <div className="flex gap-3 mb-4 animate-message-in">
      <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-amber-500 to-amber-700 ring-1 ring-amber-500/20">
        <AvatarFallback className="text-xs text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed bg-zinc-800/50 border border-zinc-700/30 text-zinc-200">
        <p className="mb-2 font-medium text-amber-300">✨ 命盘已就绪</p>
        <p className="text-zinc-400 text-xs leading-relaxed">
          我已根据您的出生信息推演出命盘。您可以问我以下问题：
        </p>
        <div className="mt-3 space-y-1.5">
          {[
            "我的八字整体格局如何？",
            "事业财运有什么特征？",
            "感情婚姻方面如何？",
            "当前大运流年运势如何？",
          ].map((q, i) => (
            <p key={i} className="text-zinc-500 text-xs">
              · {q}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
});

// ===== 消息气泡组件 =====
const MessageBubble = memo(function MessageBubble({
  message,
  isLast,
}: {
  message: ChatMessageType;
  isLast?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex gap-3 mb-4 animate-message-in ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar
        className={`h-8 w-8 shrink-0 ring-1 ${
          isUser
            ? "bg-gradient-to-br from-purple-500 to-purple-700 ring-purple-500/20"
            : "bg-gradient-to-br from-amber-500 to-amber-700 ring-amber-500/20"
        }`}
      >
        <AvatarFallback className="text-xs text-white">
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-md bg-purple-600/20 border border-purple-500/15 text-zinc-200"
            : "rounded-tl-md bg-zinc-800/40 border border-zinc-700/25 text-zinc-200"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {isLast && message.role === "assistant" && !message.content && (
            <span className="inline-flex gap-1 ml-1">
              <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          )}
          {isLast && message.role === "assistant" && message.content && (
            <span className="typing-cursor" />
          )}
        </div>
      </div>
    </div>
  );
});

// ====== 输入区域组件 ======
function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const [showSugs, setShowSugs] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const SUGGESTIONS = [
    "我的八字整体格局如何？",
    "今日财运怎么样？",
    "2026年流年运势",
    "感情方面如何？",
  ];

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    setShowSugs(false);
  }, [input, disabled, onSend]);

  const handleSuggestion = useCallback(
    (text: string) => {
      onSend(text);
      setShowSugs(false);
    },
    [onSend]
  );

  return (
    <div className="space-y-2">
      {showSugs && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/40 text-zinc-500 hover:text-zinc-200 hover:border-purple-500/30 hover:bg-zinc-800 transition-all whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 bg-zinc-900/70 border border-zinc-800/60 rounded-xl p-2 focus-within:border-purple-500/40 transition-all duration-300">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={disabled ? "AI 正在思考..." : "输入你想了解的运势问题..."}
          disabled={disabled}
          rows={1}
          className="min-h-[40px] max-h-[120px] resize-none bg-transparent border-0 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="icon"
          className="shrink-0 h-10 w-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-30 transition-all active:scale-90"
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

// ===== 页面主组件 =====
export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<{
    userId: string | null;
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
    quickQuery?: string | null;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [noSession, setNoSession] = useState(false);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatId = params?.id as string;

  // 恢复 session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("ai_fate_session");
      if (stored) {
        const data = JSON.parse(stored);
        if (data?.baziResult && data?.birthInfo) {
          setSession(data);
          // 如果有快捷查询，自动发送
          if (data.quickQuery) {
            const q = data.quickQuery;
            const cleaned = { ...data, quickQuery: null };
            sessionStorage.setItem("ai_fate_session", JSON.stringify(cleaned));
            setTimeout(() => handleSend(q, data), 500);
          }
          setReady(true);
          return;
        }
      }
      // 无有效session
      setNoSession(true);
    } catch {
      setNoSession(true);
    }
  }, []);

  // 自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages, streaming]);

  const handleSend = useCallback(
    async (content: string, sessionOverride?: typeof session) => {
      const s = sessionOverride || session;
      if (!s || streaming) return;

      const userMsg: ChatMessageType = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
      };

      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      try {
        const apiMessages = [...messages, userMsg]
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

        // 构建八字上下文
        const b = s.baziResult;
        const baziCtx = `【命盘信息】
八字：${b.four_pillars}
日主：${b.day_master}（${b.day_master_wuxing}）
性别：${b.gender}
生肖：${b.shengxiao} 星座：${b.zodiac}
农历：${b.lunar_birthday}
年柱：${b.year_pillar.heavenly_stem}${b.year_pillar.earthly_branch}
月柱：${b.month_pillar.heavenly_stem}${b.month_pillar.earthly_branch}
日柱：${b.day_pillar.heavenly_stem}${b.day_pillar.earthly_branch}
时柱：${b.hour_pillar.heavenly_stem}${b.hour_pillar.earthly_branch}
五行分布：${Object.entries(b.wuxing_distribution)
  .filter(([, c]) => c > 0)
  .map(([w, c]) => `${w}${c}`)
  .join(" ")}`.trim();

        // 获取 Agent 配置
        let agentConfig = null;
        try {
          const cr = await fetch("/api/agent-configs");
          if (cr.ok) {
            const cs = await cr.json();
            if (cs.length > 0) agentConfig = cs[0];
          }
        } catch {}

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            baziContext: baziCtx,
            agentConfig,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "AI 响应失败");
        }

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";
        const assistantId = `ai-${Date.now()}`;

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: "assistant", content: "" },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((l) => l.trim());

          for (const line of lines) {
            if (line.startsWith("0:")) {
              const text = line.slice(2).replace(/^"|"$/g, "");
              // 转义处理
              const decoded = text
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/\\"/g, '"');
              assistantContent += decoded;
              const content = assistantContent;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content } : m
                )
              );
            }
          }
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "AI 响应失败，请检查 API 配置";
        toast.error(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `抱歉，${msg}`,
          },
        ]);
      } finally {
        setStreaming(false);
      }
    },
    [messages, session, streaming]
  );

  const handleNewChat = useCallback(() => {
    sessionStorage.removeItem("ai_fate_session");
    router.push("/");
  }, [router]);

  if (noSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-zinc-700" />
          </div>
          <h2 className="text-lg font-medium text-zinc-400">还没有命盘数据</h2>
          <p className="text-sm text-zinc-600 max-w-xs">请先完成八字排盘后再查看分析</p>
          <button
            onClick={() => router.push("/")}
            className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/30"
          >
            开始测算
          </button>
        </div>
      </div>
    );
  }

  if (!ready || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
          <p className="text-sm text-zinc-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950">
      {/* ===== 顶部 ===== */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40 shrink-0 bg-zinc-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-zinc-500 hover:text-zinc-200 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm font-medium text-zinc-100 truncate">
              {session.birthInfo.name} 的命盘
            </h1>
            <p className="text-[10px] text-zinc-600 truncate">
              {session.baziResult.four_pillars}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewChat}
          className="text-zinc-600 hover:text-zinc-400 shrink-0 gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">新测算</span>
        </Button>
      </header>

      {/* ===== 主体 ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* 桌面端侧边 - 命盘卡片 */}
        <div className="hidden md:block w-72 lg:w-80 shrink-0 p-4 overflow-y-auto border-r border-zinc-800/30">
          <p className="text-[10px] text-zinc-600 mb-3 uppercase tracking-[0.15em] font-medium">
            命盘信息
          </p>
          <BaziCard bazi={session.baziResult} />
        </div>

        {/* 聊天区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 移动端命盘（折叠） */}
          <div className="md:hidden px-4 pt-3">
            <details className="group">
              <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors list-none flex items-center gap-2 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500/60" />
                查看命盘
                <svg
                  className="h-3 w-3 transition-transform group-open:rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="pb-3">
                <BaziCard bazi={session.baziResult} />
              </div>
            </details>
          </div>

          {/* 消息列表 */}
          <ScrollArea ref={scrollRef} className="flex-1 px-4 py-4">
            <div className="max-w-3xl mx-auto">
              {messages.length === 0 && !streaming && <WelcomeMessage />}
              {messages
                .filter((m) => m.role !== "system")
                .map((msg, i) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isLast={i === messages.length - 1}
                  />
                ))}
            </div>
          </ScrollArea>

          {/* 输入区 */}
          <div className="px-4 py-3 border-t border-zinc-800/30 shrink-0 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-3xl mx-auto">
              <ChatInput
                onSend={(text) => handleSend(text)}
                disabled={streaming}
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