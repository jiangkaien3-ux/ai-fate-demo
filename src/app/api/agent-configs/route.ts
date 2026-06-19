import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data } = await supabase
    .from("agent_configs")
    .select("*")
    .order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, system_prompt, model, temperature, is_active } = body;
    if (!name || !system_prompt) {
      return NextResponse.json({ error: "缺少必填参数" }, { status: 400 });
    }
    const { data, error } = await supabase
      .from("agent_configs")
      .insert({ name, system_prompt, model: model || "gpt-4o-mini", temperature: temperature || 0.7, is_active: is_active ?? true })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("保存Agent配置失败:", error);
    return NextResponse.json({ error: "保存Agent配置失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "缺少配置ID" }, { status: 400 });
    }
    const { error } = await supabase.from("agent_configs").update(updates).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新Agent配置失败:", error);
    return NextResponse.json({ error: "更新Agent配置失败" }, { status: 500 });
  }
}