"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Plus, Save, Check, Settings, Info, X } from "lucide-react";
import { toast } from "sonner";
import type { AgentConfig } from "@/lib/types";

const DEFAULT_SYSTEM_PROMPT = `你是「AI 命理师」，一位精通中国传统八字命理、五行学说、紫微斗数和风水学的资深命理顾问。

## 核心能力
- 八字命理分析：根据用户提供的四柱八字，解读命局特征
- 五行平衡分析：判断命局中五行的旺衰、喜忌
- 大运流年推演：预测各阶段的运势起伏
- 事业财运分析：分析命局中的官星、财星配置
- 感情婚姻解读：分析日支配偶宫、财官配置

## 对话风格
- 语言深邃专业，适度使用命理术语
- 在专业基础上保持通俗易懂
- 保持谦逊和开放，提醒用户命理分析仅供参考

## 输出格式
- 重要结论用 **加粗** 标注
- 分析内容应结构化，分维度展开
- 每段分析给出建议或方向性指引`;

export default function AdminPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<AgentConfig> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/agent-configs");
      if (res.ok) {
        const data = await res.json();
        setConfigs(Array.isArray(data) ? data : []);
      }
    } catch { setConfigs([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing?.name?.trim() || !editing?.system_prompt?.trim()) {
      toast.error("请填写配置名称和系统提示词");
      return;
    }

    try {
      if (isNew) {
        const res = await fetch("/api/agent-configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        if (!res.ok) throw new Error("save failed");
        toast.success("配置创建成功");
      } else if (editing.id) {
        const res = await fetch("/api/agent-configs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
        if (!res.ok) throw new Error("save failed");
        toast.success("配置更新成功");
      }
      setEditing(null);
      setIsNew(false);
      load();
    } catch {
      toast.error("保存失败，请检查 Supabase 配置");
    }
  };

  const toggleActive = async (config: AgentConfig) => {
    try {
      const res = await fetch("/api/agent-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: config.id, is_active: !config.is_active }),
      });
      if (!res.ok) throw new Error("update failed");
      toast.success(config.is_active ? "已停用" : "已启用");
      load();
    } catch { toast.error("更新失败"); }
  };

  return (
    <TooltipProvider>
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
          <Settings className="h-5 w-5 text-purple-400" />
          <h1 className="text-base font-semibold text-zinc-100">Agent 配置</h1>
        </header>

        <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
          {/* 环境信息 */}
          <Card className="mb-6 bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-3 flex items-center gap-3">
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
              <p className="text-xs text-zinc-500">
                API 在环境变量 <code className="bg-zinc-800 px-1 rounded text-zinc-400">AI_API_KEY</code>、<code className="bg-zinc-800 px-1 rounded text-zinc-400">AI_BASE_URL</code>、<code className="bg-zinc-800 px-1 rounded text-zinc-400">AI_MODEL</code> 中配置
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左侧：配置列表 */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-zinc-500 font-medium tracking-wide uppercase">已保存配置</h2>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs"
                  onClick={() => {
                    setEditing({
                      name: "",
                      system_prompt: DEFAULT_SYSTEM_PROMPT,
                      model: "gpt-4o-mini",
                      temperature: 0.7,
                      is_active: false,
                    });
                    setIsNew(true);
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  新建
                </Button>
              </div>

              <ScrollArea className="h-[420px] pr-2">
                {loading ? (
                  <div className="text-zinc-600 text-xs py-8 text-center">加载中...</div>
                ) : configs.length === 0 ? (
                  <div className="text-zinc-700 text-xs py-8 text-center border border-dashed border-zinc-800 rounded-lg">
                    暂无配置，点击新建创建
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {configs.map((config) => (
                      <Card
                        key={config.id}
                        className={`bg-zinc-900/50 border-zinc-800/50 cursor-pointer transition-all hover:bg-zinc-800/60 ${
                          editing?.id === config.id ? "ring-1 ring-purple-500/40 border-purple-500/30" : ""
                        } ${config.is_active ? "border-l-2 border-l-green-500/50" : ""}`}
                        onClick={() => { setEditing(config); setIsNew(false); }}
                      >
                        <CardContent className="p-3 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-zinc-200 truncate">{config.name}</p>
                            <p className="text-[10px] text-zinc-600 mt-0.5">
                              {config.model} · T{config.temperature}
                            </p>
                          </div>
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className="inline-flex h-7 w-7 items-center justify-center cursor-pointer shrink-0"
                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleActive(config); }}
                              >
                                <Check className={`h-3.5 w-3.5 ${config.is_active ? "text-green-400" : "text-zinc-700"}`} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs">
                              {config.is_active ? "点击停用" : "点击启用"}
                            </TooltipContent>
                          </Tooltip>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* 右侧：编辑 */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-zinc-500 font-medium tracking-wide uppercase">
                  {isNew ? "新建配置" : editing?.id ? "编辑配置" : "选择或新建配置"}
                </h2>
                {editing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-zinc-600 hover:text-zinc-400 text-xs"
                    onClick={() => { setEditing(null); setIsNew(false); }}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    取消
                  </Button>
                )}
              </div>

              {editing ? (
                <Card className="bg-zinc-900/50 border-zinc-800/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">名称</Label>
                      <Input
                        value={editing.name || ""}
                        onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))}
                        placeholder="如：八字命理师"
                        className="h-9 bg-zinc-800/50 border-zinc-700 text-zinc-100 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-zinc-400 text-xs">模型</Label>
                        <Select
                          value={editing.model || "gpt-4o-mini"}
                          onValueChange={(v: string | null) =>
                            setEditing((p) => ({ ...p!, model: v || "gpt-4o-mini" }))
                          }
                        >
                          <SelectTrigger className="h-9 bg-zinc-800/50 border-zinc-700 text-zinc-100 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                            <SelectItem value="deepseek-reasoner">DeepSeek R1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-zinc-400 text-xs">
                          温度
                          <span className="text-zinc-600 ml-1 font-normal">({editing.temperature})</span>
                        </Label>
                        <div className="flex items-center gap-2 h-9">
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={editing.temperature ?? 0.7}
                            onChange={(e) =>
                              setEditing((p) => ({ ...p!, temperature: parseFloat(e.target.value) }))
                            }
                            className="flex-1 h-1.5 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                          />
                          <span className="text-xs text-zinc-500 w-6 text-center">
                            {editing.temperature?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-zinc-400 text-xs">系统提示词 (System Prompt)</Label>
                      <Textarea
                        value={editing.system_prompt || ""}
                        onChange={(e) =>
                          setEditing((p) => ({ ...p!, system_prompt: e.target.value }))
                        }
                        rows={14}
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100 text-xs font-mono leading-relaxed"
                      />
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 transition-all"
                      onClick={handleSave}
                    >
                      <Save className="h-4 w-4 mr-1.5" />
                      保存配置
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-zinc-700 text-xs py-20 text-center border border-dashed border-zinc-800 rounded-lg">
                  <Settings className="h-8 w-8 mx-auto mb-3 text-zinc-800" />
                  在左侧选择一个配置进行编辑，或新建
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}