"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, History, Settings } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, "0")}:00`,
}));

const MINUTES = Array.from({ length: 60 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, "0")}分`,
}));

const QUICK_CARDS = [
  {
    label: "今日财运",
    icon: "💰",
    query: "请分析我今天的财运走势，包括正财和偏财方面的机会与注意事项。",
  },
  {
    label: "2026流年",
    icon: "📅",
    query: "请分析我2026年的整体运势，包括事业、财运和感情方面的关键节点。",
  },
  {
    label: "感情运势",
    icon: "❤️",
    query: "请分析我的感情婚姻运势，包括正缘特征和感情走向。",
  },
  {
    label: "事业方向",
    icon: "💼",
    query: "请分析我的事业运势，包括适合的行业方向和发展建议。",
  },
];

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "男" as "男" | "女",
    year: "1995",
    month: "1",
    day: "15",
    hour: "12",
    minute: "0",
    birthPlace: "",
  });

  useEffect(() => {
    setMounted(true);
    // 恢复上次输入
    try {
      const saved = localStorage.getItem("ai_fate_form");
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  // 自动保存表单到 localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("ai_fate_form", JSON.stringify(formData));
      } catch {}
    }
  }, [formData, mounted]);

  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleQuickTest = async (query: string) => {
    if (!formData.name.trim()) {
      toast.error("请先填写姓名再使用快捷测算");
      return;
    }
    // 直接排盘跳转，携带快捷问题
    await doSubmit(query);
  };

  const doSubmit = async (quickQuery?: string) => {
    if (!formData.name.trim()) {
      toast.error("请输入姓名");
      return;
    }

    setLoading(true);
    try {
      const birthDate = new Date(
        Number(formData.year),
        Number(formData.month) - 1,
        Number(formData.day)
      );

      const birthInfo = {
        name: formData.name,
        gender: formData.gender,
        birthDate: birthDate.toISOString(),
        birthHour: Number(formData.hour),
        birthMinute: Number(formData.minute),
        birthPlace: formData.birthPlace,
      };

      // 创建用户
      let userId: string | null = null;
      try {
        userId = localStorage.getItem("ai_fate_user_id");
      } catch {}
      if (!userId) {
        const userRes = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name }),
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.id) {
            userId = userData.id;
            try { localStorage.setItem("ai_fate_user_id", String(userId)); } catch {}
          }
        }
      }

      // 排盘
      const baziRes = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: birthDate.toISOString(),
          birthHour: Number(formData.hour),
          birthMinute: Number(formData.minute),
          gender: formData.gender,
        }),
      });
      if (!baziRes.ok) throw new Error("排盘失败");
      const baziData = await baziRes.json();

      // 保存档案
      if (userId) {
        try {
          await fetch("/api/archives", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: userId,
              name: formData.name,
              gender: formData.gender,
              birth_datetime: birthDate.toISOString(),
              birth_place: formData.birthPlace,
              bazi_json: baziData,
            }),
          });
        } catch {}
      }

      const sessionData = {
        userId,
        archiveId: null,
        birthInfo,
        baziResult: baziData,
        quickQuery: quickQuery || null,
      };
      sessionStorage.setItem("ai_fate_session", JSON.stringify(sessionData));
      router.push(`/chat/new`);
    } catch (err) {
      console.error(err);
      toast.error("排盘失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => doSubmit();

  // 生成星光粒子
  const stardustItems = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${(i * 3.4 + 7) % 100}%`,
    top: `${(i * 7.3 + 13) % 100}%`,
    delay: `${(i * 0.7) % 5}s`,
    size: `${(i % 3) + 1}px`,
    duration: `${6 + (i % 4) * 2}s`,
  }));

  if (!mounted) return null;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-zinc-950 overflow-hidden">
      {/* 星光粒子背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-purple-500/5 blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute top-[40%] right-[20%] w-[20%] h-[20%] rounded-full bg-violet-600/5 blur-[100px]" />
        {stardustItems.map((s) => (
          <div
            key={s.id}
            className="stardust"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>

      {/* 顶部导航 */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/30">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-amber-600 flex items-center justify-center text-sm">
            🔮
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <span className="gradient-text">AI 命理师</span>
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/profile"
            className="group flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <History className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">我的档案</span>
          </Link>
          <Link
            href="/admin"
            className="group flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            <Settings className="h-4 w-4 transition-transform group-hover:rotate-90" />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-6 md:py-16 overflow-y-auto">
        {/* Hero 区域 */}
        <div className="text-center mb-8 md:mb-12 max-w-xl animate-fade-up animate-fade-up-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-4">
            <Sparkles className="h-3 w-3" />
            AI 智能命理分析
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            探寻你的
            <br />
            <span className="gradient-text">命运轨迹</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-500 leading-relaxed max-w-md mx-auto">
            输入出生信息，AI 将基于传统八字命理学，
            <br />
            为你深度解析事业、感情、财运与人生命局
          </p>
        </div>

        {/* 表单卡片 */}
        <div className="w-full max-w-md animate-fade-up animate-fade-up-2">
          <Card className="bg-zinc-900/70 border-zinc-800/60 backdrop-blur-xl glow-pulse">
            {/* 装饰顶线 */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-6" />

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {/* 姓名 */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-xs font-medium tracking-wide">姓名</Label>
                  <Input
                    placeholder="输入姓名"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="h-10 bg-zinc-800/60 border-zinc-700/60 focus:border-purple-500 text-zinc-100 placeholder:text-zinc-600 transition-all"
                  />
                </div>

                {/* 性别 */}
                <div className="space-y-1.5">
                  <Label className="text-zinc-300 text-xs font-medium tracking-wide">性别</Label>
                  <div className="flex gap-2 h-10">
                    {(["男", "女"] as const).map((g) => (
                      <Button
                        key={g}
                        type="button"
                        variant={formData.gender === g ? "default" : "outline"}
                        onClick={() => handleChange("gender", g)}
                        className={`flex-1 h-full text-sm transition-all ${
                          formData.gender === g
                            ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30"
                            : "border-zinc-700/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        {g === "男" ? "♂" : "♀"} {g}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 出生日期 */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs font-medium tracking-wide">出生日期</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={formData.year}
                    onValueChange={(v: string | null) => handleChange("year", v || "1995")}
                  >
                    <SelectTrigger className="h-10 bg-zinc-800/60 border-zinc-700/60 text-zinc-100 focus:border-purple-500">
                      <SelectValue placeholder="年" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-h-60">
                      {Array.from({ length: 100 }, (_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={y} value={String(y)}>
                            {y}年
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.month}
                    onValueChange={(v: string | null) => handleChange("month", v || "1")}
                  >
                    <SelectTrigger className="h-10 bg-zinc-800/60 border-zinc-700/60 text-zinc-100">
                      <SelectValue placeholder="月" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}月
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.day}
                    onValueChange={(v: string | null) => handleChange("day", v || "15")}
                  >
                    <SelectTrigger className="h-10 bg-zinc-800/60 border-zinc-700/60 text-zinc-100">
                      <SelectValue placeholder="日" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}日
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 出生时间 */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs font-medium tracking-wide">出生时间</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={formData.hour}
                    onValueChange={(v: string | null) => handleChange("hour", v || "12")}
                  >
                    <SelectTrigger className="h-10 bg-zinc-800/60 border-zinc-700/60 text-zinc-100">
                      <SelectValue placeholder="时辰" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-h-60">
                      {HOURS.map((h) => (
                        <SelectItem key={h.value} value={h.value}>
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.minute}
                    onValueChange={(v: string | null) => handleChange("minute", v || "0")}
                  >
                    <SelectTrigger className="h-10 bg-zinc-800/60 border-zinc-700/60 text-zinc-100">
                      <SelectValue placeholder="分" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-h-60">
                      {MINUTES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 出生地 */}
              <div className="space-y-1.5">
                <Label className="text-zinc-300 text-xs font-medium tracking-wide">出生地（选填）</Label>
                <Input
                  placeholder="如：北京"
                  value={formData.birthPlace}
                  onChange={(e) => handleChange("birthPlace", e.target.value)}
                  className="h-10 bg-zinc-800/60 border-zinc-700/60 focus:border-purple-500 text-zinc-100 placeholder:text-zinc-600 transition-all"
                />
              </div>

              {/* 提交按钮 */}
              <Button
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all duration-300 hover:shadow-purple-900/50 active:scale-[0.98]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    正在推演命盘...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始推演
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 快捷入口卡片 */}
        <div className="mt-8 w-full max-w-md animate-fade-up animate-fade-up-3">
          <p className="text-[10px] text-zinc-600 text-center mb-3 uppercase tracking-[0.2em] font-medium">
            快捷测算
          </p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_CARDS.map((card) => (
              <button
                key={card.label}
                onClick={() => handleQuickTest(card.query)}
                disabled={loading}
                className="group relative overflow-hidden rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4 text-left transition-all duration-300 hover:bg-zinc-800/60 hover:border-zinc-700/60 hover-lift disabled:opacity-50"
              >
                {/* hover 光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-600/5 transition-all duration-300" />
                <div className="relative">
                  <span className="text-2xl block mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-5deg]">
                    {card.icon}
                  </span>
                  <p className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                    {card.label}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 line-clamp-1">
                    点击开始分析
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 页脚 */}
        <div className="mt-10 mb-6 text-center animate-fade-up animate-fade-up-4">
          <p className="text-[11px] text-zinc-700 leading-relaxed">
            仅供娱乐参考 · 命运掌握在自己手中
          </p>
        </div>
      </main>
    </div>
  );
}