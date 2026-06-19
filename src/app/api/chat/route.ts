import { streamText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, baziContext, agentConfig } = await req.json();

    // 从请求中获取模型配置，或使用默认值
    const modelConfig = agentConfig || {
      model: process.env.AI_MODEL || "gpt-4o-mini",
      baseUrl: process.env.AI_BASE_URL || "https://api.openai.com/v1",
      apiKey: process.env.AI_API_KEY || "",
    };

    const baseUrl = modelConfig.baseUrl?.replace(/\/+$/, "") || "https://api.openai.com/v1";
    const apiKey = modelConfig.apiKey || process.env.AI_API_KEY || "";
    const modelName = modelConfig.model || "gpt-4o-mini";

    // 如果没配置API Key，返回错误信息（展示模式）
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "API密钥未配置，请在环境变量中设置 AI_API_KEY",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const provider = createOpenAICompatible({
      baseURL: baseUrl,
      name: "customProvider",
      apiKey: apiKey,
    });

    // 构建系统提示词
    const defaultSystemPrompt = `你是「AI 命理师」，一位精通中国传统八字命理、五行学说、紫微斗数和风水学的资深命理顾问。

## 核心能力
- 八字命理分析：根据用户提供的四柱八字，解读命局特征
- 五行平衡分析：判断命局中五行的旺衰、喜忌
- 大运流年推演：预测各阶段的运势起伏
- 事业财运分析：分析命局中的官星、财星配置
- 感情婚姻解读：分析日支配偶宫、财官配置
- 姓名学分析：从五行补益角度解读姓名
- 择日建议：基于天干地支选择吉日

## 对话风格
- 语言深邃专业，适度使用命理术语（如：食神生财、七杀制身、伤官见官等）
- 在专业基础上保持通俗易懂，避免过于晦涩
- 保持谦逊和开放，提醒用户命理分析仅供参考
- 适当引用五行生克制化的原理来解释
- 根据八字命盘信息给出针对性的分析，而非泛泛而谈

## 输出格式
- 重要结论用 **加粗** 标注
- 分析内容应结构化，分维度展开
- 适当使用五行符号：木🟢 火🔴 土🟡 金⚪ 水🔵
- 每段分析最好给出建议或方向性指引

## 注意事项
- 不承诺100%准确，强调命理是概率和趋势
- 不替代专业医疗、法律建议
- 保持积极正向的引导，不给用户制造焦虑
- 对命理术语做必要的解释`;

    const systemPrompt = modelConfig.system_prompt || process.env.SYSTEM_PROMPT || defaultSystemPrompt;

    // 构建上下文
    const contextMessages = [];
    if (baziContext) {
      contextMessages.push({
        role: "system",
        content: `以下是用户的八字命盘信息，请据此进行分析回答：\n\n${baziContext}`,
      });
    }

    const result = streamText({
      model: provider.languageModel(modelName),
      system: systemPrompt,
      messages: [...contextMessages, ...messages],
      temperature: modelConfig.temperature ?? 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "AI响应失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}