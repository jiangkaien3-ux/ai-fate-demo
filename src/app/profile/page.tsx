"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, User, Calendar, Sparkles, BookOpen } from "lucide-react";
import type { BaziArchive, BaziResult } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [archives, setArchives] = useState<BaziArchive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      let userId: string | null = null;
      try { userId = localStorage.getItem("ai_fate_user_id"); } catch {}
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
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

      // Fallback to session
      try {
        const stored = sessionStorage.getItem("ai_fate_session");
        if (stored) {
          const session = JSON.parse(stored);
          const bazi: BaziResult = session.baziResult;
          setArchives([{
            id: "local",
            user_id: userId,
            name: session.birthInfo?.name || "未知",
            gender: session.birthInfo?.gender || "男",
            birth_datetime: session.birthInfo?.birthDate || "",
            birth_place: session.birthInfo?.birthPlace || "",
            bazi_json: bazi,
            created_at: new Date().toISOString(),
          }] as unknown as BaziArchive[]);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleOpenArchive = (archive: BaziArchive) => {
    const bazi = archive.bazi_json as unknown as BaziResult;
    const birthDate = new Date(archive.birth_datetime);
    const sessionData = {
      userId: archive.user_id,
      archiveId: archive.id,
      birthInfo: {
        name: archive.name,
        gender: archive.gender,
        birthDate: archive.birth_datetime,
        birthHour: birthDate.getHours(),
        birthMinute: birthDate.getMinutes(),
        birthPlace: archive.birth_place,
      },
      baziResult: bazi,
      quickQuery: null,
    };
    sessionStorage.setItem("ai_fate_session", JSON.stringify(sessionData));
    router.push(`/chat/${archive.id}`);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    } catch { return dateStr; }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(diff / 86400000);
      if (days === 0) return "今天";
      if (days === 1) return "昨天";
      if (days < 7) return `${days}天前`;
      if (days < 30) return `${Math.floor(days / 7)}周前`;
      return `${Math.floor(days / 30)}个月前`;
    } catch { return ""; }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/30 bg-zinc-950/80 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="text-zinc-500 hover:text-zinc-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <BookOpen className="h-5 w-5 text-purple-400" />
        <h1 className="text-base font-semibold text-zinc-100">我的命盘档案</h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
            <span className="ml-2 text-sm text-zinc-600">加载中...</span>
          </div>
        ) : archives.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <History className="h-8 w-8 text-zinc-700" />
            </div>
            <h2 className="text-lg font-medium text-zinc-400 mb-2">还没有命盘记录</h2>
            <p className="text-sm text-zinc-600 mb-8 max-w-xs">
              完成首次八字测算后，你的命盘档案会自动保存在这里
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 transition-all"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              开始测算
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 mb-4">
              共 {archives.length} 条记录
            </p>
            {archives.map((archive) => {
              const bazi = archive.bazi_json as unknown as BaziResult;
              return (
                <Card
                  key={archive.id}
                  className="bg-zinc-900/60 border-zinc-800/50 hover:bg-zinc-900/80 transition-all cursor-pointer group hover-lift"
                  onClick={() => handleOpenArchive(archive)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-purple-600/15 border border-purple-500/15 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-zinc-100 text-sm truncate">{archive.name}</h3>
                          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                            {bazi.four_pillars}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-[10px] text-zinc-600 border-zinc-700/50 shrink-0"
                      >
                        {archive.gender}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-zinc-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(archive.birth_datetime)}
                      </span>
                      {archive.birth_place && (
                        <span>· {archive.birth_place}</span>
                      )}
                      <span className="text-zinc-700">· {formatTimeAgo(archive.created_at)}</span>
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