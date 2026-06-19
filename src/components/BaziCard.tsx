"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaziResult } from "@/lib/types";

const WUXING_COLORS: Record<string, string> = {
  木: "text-green-400 bg-green-500/10 border-green-500/20",
  火: "text-red-400 bg-red-500/10 border-red-500/20",
  土: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  金: "text-zinc-300 bg-zinc-500/10 border-zinc-500/20",
  水: "text-blue-400 bg-blue-500/10 border-blue-500/20",
};

const WUXING_EMOJIS: Record<string, string> = {
  木: "🟢",
  火: "🔴",
  土: "🟡",
  金: "⚪",
  水: "🔵",
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

  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-purple-950/30 border-zinc-800 overflow-hidden">
      {/* 装饰线 */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <CardContent className="p-4 space-y-4">
        {/* 四柱八字 */}
        <div>
          <p className="text-xs text-zinc-500 mb-2 font-medium tracking-wider">
            四柱八字
          </p>
          <div className="grid grid-cols-4 gap-2">
            {pillars.map((p) => (
              <div
                key={p.label}
                className="text-center p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/50"
              >
                <p className="text-[10px] text-zinc-500 mb-1">{p.label}</p>
                <p className="text-lg font-bold tracking-wider text-amber-300">
                  {p.stem}
                  {p.branch}
                </p>
                <p className={`text-[10px] ${p.label === "日柱" ? "text-purple-400 font-medium" : "text-zinc-500"}`}>
                  {WUXING_EMOJIS[p.wuxing] || ""} {p.wuxing}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 日主 + 五行信息 */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-300 border-purple-500/30"
          >
            🏮 日主：{bazi.day_master}（{bazi.day_master_wuxing}）
          </Badge>
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-300 border-amber-500/30"
          >
            🐉 生肖：{bazi.shengxiao}
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-300 border-blue-500/30"
          >
            ⭐ 星座：{bazi.zodiac}
          </Badge>
        </div>

        {/* 五行分布 */}
        <div>
          <p className="text-xs text-zinc-500 mb-2 font-medium tracking-wider">
            五行分布
          </p>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(bazi.wuxing_distribution)
              .filter(([, count]) => count > 0)
              .map(([wx, count]) => (
                <Badge
                  key={wx}
                  variant="outline"
                  className={`${WUXING_COLORS[wx] || ""} text-xs`}
                >
                  {WUXING_EMOJIS[wx]} {wx} × {count}
                </Badge>
              ))}
          </div>
        </div>

        {/* 纳音 + 十神 */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-zinc-500 mb-1">纳音</p>
            <div className="space-y-0.5">
              {bazi.nayin.map((n, i) => (
                <p key={i} className="text-zinc-300">
                  {["年", "月", "日", "时"][i]}：{n}
                </p>
              ))}
            </div>
          </div>
          <div>
            <p className="text-zinc-500 mb-1">十神</p>
            <div className="space-y-0.5">
              {bazi.shishen.map((s, i) => (
                <p key={i} className="text-zinc-300">
                  {["年", "月", "日", "时"][i]}：{s}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* 农历 */}
        <p className="text-[10px] text-zinc-600">
          农历：{bazi.lunar_birthday}
        </p>
      </CardContent>
    </Card>
  );
}

export function BaziCardSkeleton() {
  return (
    <Card className="bg-zinc-900/80 border-zinc-800 animate-pulse">
      <div className="h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      <CardContent className="p-4 space-y-4">
        <div className="h-3 w-20 bg-zinc-800 rounded" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-zinc-800 rounded-full" />
          <div className="h-6 w-20 bg-zinc-800 rounded-full" />
        </div>
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-zinc-800 rounded-full" />
          <div className="h-5 w-14 bg-zinc-800 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}