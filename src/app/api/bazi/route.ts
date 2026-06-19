import { NextRequest, NextResponse } from "next/server";
import { calculateBazi } from "@/lib/bazi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthDate, birthHour, birthMinute, gender } = body;

    if (!birthDate || birthHour === undefined || birthMinute === undefined || !gender) {
      return NextResponse.json(
        { error: "缺少必填参数：birthDate, birthHour, birthMinute, gender" },
        { status: 400 }
      );
    }

    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "无效的日期格式" }, { status: 400 });
    }

    const result = calculateBazi(date, Number(birthHour), Number(birthMinute), gender);
    return NextResponse.json(result);
  } catch (error) {
    console.error("八字排盘错误:", error);
    return NextResponse.json({ error: "排盘计算失败" }, { status: 500 });
  }
}