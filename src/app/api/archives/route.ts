import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, gender, birth_datetime, birth_place, bazi_json } = body;

    if (!user_id || !name || !gender || !birth_datetime || !bazi_json) {
      return NextResponse.json({ error: "缺少必填参数" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("archives")
      .insert({ user_id, name, gender, birth_datetime, birth_place, bazi_json })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("保存命盘失败:", error);
    return NextResponse.json({ error: "保存命盘失败" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  const id = searchParams.get("id");

  if (id) {
    const { data } = await supabase.from("archives").select("*").eq("id", id).single();
    return NextResponse.json(data);
  }

  if (!user_id) {
    return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
  }

  const { data } = await supabase
    .from("archives")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少档案ID" }, { status: 400 });
  }
  const { error } = await supabase.from("archives").delete().eq("id", id);
  if (error) throw error;
  return NextResponse.json({ success: true });
}