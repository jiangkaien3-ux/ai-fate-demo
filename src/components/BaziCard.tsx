"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaziResult } from "@/lib/types";

const WUXING_META: Record<string, { color: string; emoji: string; bg: string; bar: string }> = {
  木: { color: "text-green-400", emoji: "🟢", bg: "bg-green-500/10 border-green-500/20", bar: "bg-green-500/50" },
  火: { color: "text-red-400", emoji: "🔴", bg: "bg-red-500/10 border-red-500/20", bar: "bg-red-500/50" },
  土: { color: "text-yellow-400", emoji: "🟡", bg: "bg-yellow-500/10 border-yellow-500/20", bar: "bg-yellow-500/50" },
  金: { color: "text-zinc-300", emoji: "⚪", bg: "bg-zinc-500/10 border-zinc-500/20", bar: "bg-zinc-500/50" },
  水: { color: "text-blue-400", emoji: "🔵", bg: "bg-blue-500/10 border-blue-500/20", bar: "bg-blue-500/50" },
};

interface BaziCardProps {
  bazi: BaziResult;
}

export function BaziCard({ bazi }: BaziCardProps) {
  const pillars = [
    { label: "年柱", stem: bazi.year_pillar.heavenly_stem, branch: bazi.year_pillar.earthly_branch, wuxing: bazi.year_pillar.wuxing, nayin: bazi.year_pillar.nayin, shishen: bazi.year_pillar.shishen },
    { label: "月柱", stem: bazi.month_pillar.heavenly_stem, branch: bazi.month_pillar.earthly_branch, wuxing: bazi.month_pillar.wuxing, nayin: bazi.month_pillar.nayin, shishen: bazi.month_pillar.shishen },
    { label: "日柱", stem: bazi.day_pillar.heavenly_stem, branch: bazi.day_pillar.earthly_branch, wuxing: bazi.day_pillar.wuxing, nayin: bazi.day_pillar.nayin, shishen: bazi.day_pillar.shishen },
    { label: "时柱", stem: bazi.hour_pillar.heavenly_stem, branch: bazi.hour_pillar.earthly_branch, wuxing: bazi.hour_pillar.wuxing, nayin: bazi.hour_pillar.nayin, shishen: bazi.hour_pillar.shishen },
  ];

  const wxEntries = Object.entries(bazi.wuxing_distribution).filter(([, c]) => c > 0);
  const maxCount = Math.max(...wxEntries.map(([, c]) => c), 1);

  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-purple-950/20 border-zinc-800/60 overflow-hidden">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent mx-4" />
      <CardContent className="p-4 space-y-4">
        {/* 四柱 */}
        <div>
          <p className="text-[10px] text-zinc-600 mb-2 font-medium tracking-[0.12em] uppercase">
            四柱八字
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {pillars.map((p) => {
              const isDay = p.label === "日柱";
              return (
                <div
                  key={p.label}
                  className={`text-center p-2 rounded-lg border transition-colors ${
                    isDay
                      ? "bg-purple-500/10 border-purple-500/25 ring-1 ring-purple-500/20"
                      : "bg-zinc-800/40 border-zinc-700/40"
                  }`}
                >
                  <p className="text-[9px] text-zinc-600 mb-0.5">{p.label}</p>
                  <p className={`text-base font-bold tracking-wider ${
                    isDay ? "text-purple-300" : "text-amber-200/90"
                  }`}>
                    {p.stem}{p.branch}
                  </p>
                  <p className={`text-[9px] mt-0.5 ${WUXING_META[p.wuxing]?.color || "text-zinc-600"}`}>
                    {WUXING_META[p.wuxing]?.emoji || ""} {p.wuxing}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 日主 + 生肖 + 星座 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="bg-purple-500/10 text-purple-300 border-purple-500/25 text-[10px] font-normal">
            🏮 日主 {bazi.day_master}（{bazi.day_master_wuxing}）
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-300 border-amber-500/25 text-[10px] font-normal">
            🐉 {bazi.shengxiao}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/25 text-[10px] font-normal">
            ⭐ {bazi.zodiac}
          </Badge>
        </div>

        {/* 五行分布 - 进度条可视化 */}
        <div>
          <p className="text-[10px] text-zinc-600 mb-2 font-medium tracking-[0.12em] uppercase">
            五行分布
          </p>
          <div className="space-y-1.5">
            {wxEntries.map(([wx, count]) => {
              const meta = WUXING_META[wx];
              const pct = (count / maxCount) * 100;
              return (
                <div key={wx} className="flex items-center gap-2">
                  <span className={`text-xs w-4 text-center ${meta?.color || ""}`}>
                    {meta?.emoji}
                  </span>
                  <span className={`text-[11px] w-4 font-medium ${meta?.color || ""}`}>
                    {wx}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${meta?.bar || "bg-zinc-600"}`}
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 纳音 + 十神 */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <p className="text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">纳音</p>
            <div className="space-y-0.5">
              {bazi.nayin.map((n, i) => (
                <p key={i} className="text-[11px] text-zinc-400">
                  {["年", "月", "日", "时"][i]}·{n}
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9px] text-zinc-600 mb-1 uppercase tracking-wider">十神</p>
            <div className="space-y-0.5">
              {bazi.shishen.map((s, i) => (
                <p key={i} className="text-[11px] text-zinc-400">
                  {["年", "月", "日", "时"][i]}·{s}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 农历 */}
        <p className="text-[9px] text-zinc-700 pt-1 border-t border-zinc-800/40">
          农历 {bazi.lunar_birthday}
        </p>
      </CardContent>
    </Card>
  );
}

export function BaziCardSkeleton() {
  return (
    <Card className="bg-zinc-900/80 border-zinc-800/60 overflow-hidden">
      <div className="h-[2px] bg-zinc-800 mx-4" />
      <CardContent className="p-4 space-y-4">
        <div className="skeleton-shimmer h-3 w-16 rounded" />
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-1.5">
          <div className="skeleton-shimmer h-5 w-20 rounded-full" />
          <div className="skeleton-shimmer h-5 w-16 rounded-full" />
        </div>
        <div className="skeleton-shimmer h-3 w-16 rounded" />
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="skeleton-shimmer h-3 w-4 rounded" />
              <div className="skeleton-shimmer h-2 flex-1 rounded-full" />
              <div className="skeleton-shimmer h-3 w-4 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}