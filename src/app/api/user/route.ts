import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    const { data, error } = await supabase
      .from("users")
      .insert({ name: name || null })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("创建用户失败:", error);
    return NextResponse.json({ error: "创建用户失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
  }
  const { data } = await supabase.from("users").select("*").eq("id", id).single();
  return NextResponse.json(data);
}