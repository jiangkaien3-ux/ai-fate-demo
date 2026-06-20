import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, baziContext, agentConfig } = await req.json();

    // 读取环境变量
    const envApiKey = process.env.AI_API_KEY || "";
    const envBaseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
    const envModel = process.env.AI_MODEL || "gpt-4o-mini";

    // 如果前端传了agentConfig且有apiKey，优先用它（Admin配置）
    // 否则用环境变量
    const apiKey = (agentConfig?.apiKey || envApiKey);
    const baseUrl = agentConfig?.baseUrl?.replace(/\/+$/, "") || envBaseUrl;
    const modelName = agentConfig?.model || envModel;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API密钥未配置，请在 Vercel 环境变量中设置 AI_API_KEY",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const provider = createOpenAICompatible({
      baseURL: baseUrl,
      name: "customProvider",
      apiKey: apiKey,
    });

    const defaultSystemPrompt = `你是「AI 命理师」，一位精通中国传统八字命理、五行学说、紫微斗数和风水学的资深命理顾问。

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

    const systemPrompt = agentConfig?.system_prompt || defaultSystemPrompt;

    // 构建带八字上下文的system消息
    const fullMessages = [];
    if (baziContext) {
      fullMessages.push({
        role: "system" as const,
        content: `以下是用户的八字命盘信息，请据此进行分析回答：\n\n${baziContext}`,
      });
    }

    const result = streamText({
      model: provider.languageModel(modelName),
      system: systemPrompt,
      messages: [...fullMessages, ...messages],
      temperature: agentConfig?.temperature ?? 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: "AI响应失败",
        detail: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}