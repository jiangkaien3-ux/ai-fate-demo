"use client";

import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";
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

const QUICK_ACTIONS = [
  { label: "今日财运", icon: "💰", desc: "今日财运走势分析" },
  { label: "2026流年", icon: "📅", desc: "2026年整体运势" },
  { label: "感情运势", icon: "❤️", desc: "感情婚姻分析" },
  { label: "事业方向", icon: "💼", desc: "事业发展与晋升" },
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "男" as "男" | "女",
    year: String(new Date().getFullYear() - 30),
    month: "1",
    day: "15",
    hour: "12",
    minute: "0",
    birthPlace: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
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

      // 先创建用户或获取已有用户
      let userId = localStorage.getItem("ai_fate_user_id");
      if (!userId) {
        const userRes = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name }),
        });
        if (!userRes.ok) throw new Error("创建用户失败");
        const userData = await userRes.json();
        userId = userData.id;
        if (userId) localStorage.setItem("ai_fate_user_id", userId);
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

      // 保存档案到 Supabase
      let archive;
      try {
        const archiveRes = await fetch("/api/archives", {
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
        if (archiveRes.ok) {
          archive = await archiveRes.json();
        }
      } catch {
        // Supabase 没配置时忽略
      }

      // 将数据传到聊天页
      const sessionData = {
        userId,
        archiveId: archive?.id || null,
        birthInfo,
        baziResult: baziData,
      };
      sessionStorage.setItem("ai_fate_session", JSON.stringify(sessionData));

      router.push(`/chat/${archive?.id || "new"}`);
    } catch (err) {
      console.error(err);
      toast.error("排盘失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* 背景装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px]" />
      </div>

      {/* 顶部导航 */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <span className="text-lg font-semibold tracking-tight">
            <span className="gradient-text">AI 命理师</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            我的档案
          </Link>
          <Link
            href="/admin"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            配置
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-8 md:py-16">
        {/* 标题区 */}
        <div className="text-center mb-8 md:mb-12 max-w-lg">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            探寻你的
            <span className="gradient-text">命运轨迹</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-500 leading-relaxed">
            输入出生信息，AI 将基于传统八字命理学
            <br />
            为你深度解析事业、感情、财运与人生命局
          </p>
        </div>

        {/* 表单卡片 */}
        <Card className="w-full max-w-md bg-zinc-900/60 border-zinc-800 backdrop-blur-sm">
          <CardContent className="p-6 space-y-5">
            {/* 姓名 */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">姓名</Label>
              <Input
                placeholder="请输入姓名"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 focus:border-purple-500 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            {/* 性别 */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">性别</Label>
              <div className="flex gap-3">
                {(["男", "女"] as const).map((g) => (
                  <Button
                    key={g}
                    type="button"
                    variant={formData.gender === g ? "default" : "outline"}
                    onClick={() => handleChange("gender", g)}
                    className={
                      formData.gender === g
                        ? "flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        : "flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-100"
                    }
                  >
                    {g === "男" ? "♂ 男" : "♀ 女"}
                  </Button>
                ))}
              </div>
            </div>

            {/* 出生日期 */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">出生日期</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={formData.year} onValueChange={(v: string | null) => handleChange("year", v || "")}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
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
                <Select value={formData.month} onValueChange={(v: string | null) => handleChange("month", v || "")}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
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
                <Select value={formData.day} onValueChange={(v: string | null) => handleChange("day", v || "")}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
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
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">出生时间</Label>
              <div className="grid grid-cols-2 gap-2">
                <Select value={formData.hour} onValueChange={(v: string | null) => handleChange("hour", v || "")}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
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
                <Select value={formData.minute} onValueChange={(v: string | null) => handleChange("minute", v || "")}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
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
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">出生地（选填）</Label>
              <Input
                placeholder="如：北京"
                value={formData.birthPlace}
                onChange={(e) => handleChange("birthPlace", e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 focus:border-purple-500 text-zinc-100 placeholder:text-zinc-600"
              />
            </div>

            {/* 提交按钮 */}
            <Button
              className="w-full py-6 text-base font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all duration-300"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  正在推演命盘...
                </>
              ) : (
                "✨ 开始推演"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 快捷入口 */}
        <div className="mt-10 w-full max-w-md">
          <p className="text-xs text-zinc-600 text-center mb-4 uppercase tracking-wider">
            快捷测算
          </p>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-3 px-4 flex-col items-center gap-1 bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-all"
                onClick={() => toast.info("请先输入信息完成排盘")}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-xs font-medium">{action.label}</span>
                <span className="text-[10px] text-zinc-600">{action.desc}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* 页脚 */}
        <p className="mt-12 text-xs text-zinc-700 text-center">
          仅供娱乐参考 · 命运掌握在自己手中
        </p>
      </main>
    </div>
  );
}