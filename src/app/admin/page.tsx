"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Save, Check, Settings, Info } from "lucide-react";
import { toast } from "sonner";
import type { AgentConfig } from "@/lib/types";

const DEFAULT_SYSTEM_PROMPT = `你是「AI 命理师」，一位精通中国传统八字命理、五行学说、紫微斗数和风水学的资深命理顾问。

## 核心能力
- 八字命理分析：根据用户提供的四柱八字，解读命局特征
- 五行平衡分析：判断命局中五行的旺衰、喜忌
- 大运流年推演：预测各阶段的运势起伏
- 事业财运分析：分析命局中的官星、财星配置
- 感情婚姻解读：分析日支配偶宫、财官配置
- 姓名学分析：从五行补益角度解读姓名

## 对话风格
- 语言深邃专业，适度使用命理术语
- 在专业基础上保持通俗易懂
- 保持谦逊和开放，提醒用户命理分析仅供参考
- 适当引用五行生克制化的原理来解释

## 输出格式
- 重要结论用 **加粗** 标注
- 分析内容应结构化，分维度展开
- 适当使用五行符号：木🟢 火🔴 土🟡 金⚪ 水🔵
- 每段分析最好给出建议或方向性指引`;

const DEFAULT_MODEL = "gpt-4o-mini";

export default function AdminPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<Partial<AgentConfig> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [envInfo, setEnvInfo] = useState<{
    hasApiKey: boolean;
    baseUrl: string;
    model: string;
  } | null>(null);

  const loadConfigs = async () => {
    try {
      const res = await fetch("/api/agent-configs");
      if (res.ok) {
        const data = await res.json();
        setConfigs(Array.isArray(data) ? data : []);
      }
    } catch {
      // Supabase 没配置
      setConfigs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadConfigs();

    // 尝试获取环境信息
    setEnvInfo({
      hasApiKey: !!process.env.NEXT_PUBLIC_AI_API_KEY || !!process.env.AI_API_KEY,
      baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL || process.env.AI_BASE_URL || "https://api.openai.com/v1",
      model: process.env.NEXT_PUBLIC_AI_MODEL || process.env.AI_MODEL || DEFAULT_MODEL,
    });
  }, []);

  const handleSave = async () => {
    if (!editingConfig?.name || !editingConfig?.system_prompt) {
      toast.error("请填写配置名称和系统提示词");
      return;
    }

    try {
      if (isNew) {
        const res = await fetch("/api/agent-configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingConfig),
        });
        if (!res.ok) throw new Error("保存失败");
        toast.success("配置创建成功");
      } else if (editingConfig.id) {
        const res = await fetch("/api/agent-configs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingConfig),
        });
        if (!res.ok) throw new Error("保存失败");
        toast.success("配置更新成功");
      }
      setEditingConfig(null);
      setIsNew(false);
      loadConfigs();
    } catch {
      toast.error("保存失败，请检查 Supabase 配置");
    }
  };

  const handleToggleActive = async (config: AgentConfig) => {
    try {
      const res = await fetch("/api/agent-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: config.id, is_active: !config.is_active }),
      });
      if (!res.ok) throw new Error("更新失败");
      toast.success(config.is_active ? "已停用" : "已启用");
      loadConfigs();
    } catch {
      toast.error("更新失败");
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
        <Settings className="h-5 w-5 text-purple-400" />
        <h1 className="text-lg font-semibold text-zinc-100">Agent 配置管理</h1>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* 环境信息提示 */}
        <Card className="mb-6 bg-zinc-900/60 border-zinc-800">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-zinc-400">
              <p>
                API 配置：
                {envInfo?.hasApiKey ? (
                  <Badge className="ml-2 bg-green-500/10 text-green-400 border-green-500/30">已配置</Badge>
                ) : (
                  <Badge className="ml-2 bg-red-500/10 text-red-400 border-red-500/30">未配置</Badge>
                )}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                API Base URL：{envInfo?.baseUrl || "未设置"}
                <span className="ml-2">默认模型：{envInfo?.model}</span>
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                在 <code className="bg-zinc-800 px-1 rounded">.env.local</code> 中设置 AI_API_KEY、AI_BASE_URL、AI_MODEL
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 配置列表 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-zinc-400">已保存配置</h2>
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:text-zinc-100"
                onClick={() => {
                  setEditingConfig({
                    name: "",
                    system_prompt: DEFAULT_SYSTEM_PROMPT,
                    model: DEFAULT_MODEL,
                    temperature: 0.7,
                    is_active: false,
                  });
                  setIsNew(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                新建
              </Button>
            </div>

            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="text-zinc-500 text-sm py-8 text-center">加载中...</div>
              ) : configs.length === 0 ? (
                <div className="text-zinc-600 text-sm py-8 text-center">
                  暂无配置，点击"新建"创建第一个 Agent 角色
                </div>
              ) : (
                <div className="space-y-2">
                  {configs.map((config) => (
                    <Card
                      key={config.id}
                      className={`bg-zinc-900/60 border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800/60 ${
                        config.is_active ? "ring-1 ring-purple-500/30" : ""
                      }`}
                      onClick={() => {
                        setEditingConfig(config);
                        setIsNew(false);
                      }}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-100 truncate">
                              {config.name}
                            </span>
                            {config.is_active && (
                              <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">
                                启用
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-600 mt-0.5">
                            {config.model} · 温度 {config.temperature}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(config);
                          }}
                        >
                          <Check className={`h-4 w-4 ${config.is_active ? "text-green-400" : "text-zinc-600"}`} />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* 编辑区 */}
          <div>
            <h2 className="text-sm font-medium text-zinc-400 mb-4">
              {isNew ? "新建配置" : editingConfig?.id ? "编辑配置" : "选择或新建配置"}
            </h2>

            {editingConfig ? (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs">配置名称</Label>
                    <Input
                      value={editingConfig.name || ""}
                      onChange={(e) =>
                        setEditingConfig((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="如：八字命理师"
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">模型</Label>
                      <Select
                        value={editingConfig.model || DEFAULT_MODEL}
                        onValueChange={(v: string | null) =>
                          setEditingConfig((prev) => ({ ...prev!, model: v || "" }))
                        }
                      >
                        <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-zinc-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                          <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
                          <SelectItem value="deepseek-reasoner">DeepSeek R1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">温度 ({editingConfig.temperature})</Label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={editingConfig.temperature ?? 0.7}
                        onChange={(e) =>
                          setEditingConfig((prev) => ({
                            ...prev,
                            temperature: parseFloat(e.target.value) || 0.7,
                          }))
                        }
                        className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-400 text-xs">系统提示词 (System Prompt)</Label>
                    <Textarea
                      value={editingConfig.system_prompt || ""}
                      onChange={(e) =>
                        setEditingConfig((prev) => ({ ...prev, system_prompt: e.target.value }))
                      }
                      rows={12}
                      className="bg-zinc-800/50 border-zinc-700 text-zinc-100 text-xs font-mono leading-relaxed"
                    />
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    保存配置
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="text-zinc-600 text-sm py-20 text-center border border-dashed border-zinc-800 rounded-lg">
                在左侧选择一个配置进行编辑，或新建一个配置
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}