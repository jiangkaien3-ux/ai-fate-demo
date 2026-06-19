"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, User, Calendar, ExternalLink, Sparkles } from "lucide-react";
import type { BaziArchive, BaziResult } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [archives, setArchives] = useState<BaziArchive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArchives = async () => {
      const userId = localStorage.getItem("ai_fate_user_id");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // 尝试从 Supabase 获取（本地数据库可能没配，fallback 到 localStorage）
        const res = await fetch(`/api/archives?user_id=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setArchives(data);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Fallback: 从本地 session 恢复
      const stored = sessionStorage.getItem("ai_fate_session");
      if (stored) {
        try {
          const session = JSON.parse(stored);
          const bazi: BaziResult = session.baziResult;
          // 构造一个本地档案
          setArchives([
            {
              id: "local",
              user_id: userId || "",
              name: session.birthInfo?.name || "未知",
              gender: session.birthInfo?.gender || "男",
              birth_datetime: session.birthInfo?.birthDate || "",
              birth_place: session.birthInfo?.birthPlace || "",
              bazi_json: bazi,
              created_at: new Date().toISOString(),
            } as unknown as BaziArchive,
          ]);
        } catch {}
      }
      setLoading(false);
    };

    loadArchives();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-zinc-100">我的档案</h1>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
            <span className="ml-2 text-zinc-500">加载中...</span>
          </div>
        ) : archives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <History className="h-12 w-12 text-zinc-700 mb-4" />
            <h2 className="text-lg font-medium text-zinc-400 mb-2">暂无命盘记录</h2>
            <p className="text-sm text-zinc-600 mb-6">还没有进行过八字测算</p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
            >
              ✨ 开始测算
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 mb-4">
              共 {archives.length} 条命盘记录
            </p>
            {archives.map((archive) => {
              const bazi = archive.bazi_json as unknown as BaziResult;
              return (
                <Card
                  key={archive.id}
                  className="bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900/80 transition-colors cursor-pointer"
                  onClick={() => {
                    // 将档案数据存入 session 然后跳转到聊天页
                    const sessionData = {
                      userId: archive.user_id,
                      archiveId: archive.id,
                      birthInfo: {
                        name: archive.name,
                        gender: archive.gender,
                        birthDate: archive.birth_datetime,
                        birthHour: 12,
                        birthMinute: 0,
                        birthPlace: archive.birth_place,
                      },
                      baziResult: bazi,
                    };
                    sessionStorage.setItem("ai_fate_session", JSON.stringify(sessionData));
                    router.push(`/chat/${archive.id}`);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-500/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-zinc-100">{archive.name}</h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {bazi.four_pillars}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-zinc-500 border-zinc-700"
                      >
                        {archive.gender}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(archive.birth_datetime)}
                      </span>
                      {archive.birth_place && (
                        <span>{archive.birth_place}</span>
                      )}
                      <span className="flex items-center gap-1 ml-auto text-purple-500">
                        查看分析 <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}