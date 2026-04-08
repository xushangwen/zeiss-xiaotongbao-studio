import { NextRequest, NextResponse } from 'next/server'

const MODEL = 'gemini-3.1-pro-preview'

// Gemini 返回的 part 结构（含 thought 标记）
interface GeminiPart {
  text?: string
  thought?: boolean
}

// 专业提示词工程师系统指令
const SYSTEM_INSTRUCTION = `你是一位专精 AI 图像生成的提示词工程师，服务于 ZEISS 小瞳堡儿童教育品牌的插画生产工作台。

你的工作原则：
1. **深度理解调整意图**：不只看字面，更要理解背后的视觉诉求和品牌适配性
2. **精准外科式修改**：只针对用户指出的问题做改动，不随意改变其他已确定的设计元素
3. **保持构图与叙事完整性**：调整后的提示词仍需具备完整的场景叙述能力
4. **英文输出**：提示词必须是流畅的英文，以最大化图像模型的理解准确度
5. **仅输出提示词本身**：不加解释、不加标题、不加引号，直接输出优化后的提示词文本`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY 未配置' }, { status: 500 })
  }

  const body = await req.json()
  const { scenePrompt, styleDNA, userFeedback } = body as {
    scenePrompt: string
    styleDNA: string
    userFeedback: string
  }

  if (!userFeedback?.trim()) {
    return NextResponse.json({ error: '请输入调整需求' }, { status: 400 })
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  // 构建上下文：把当前场景描述 + 风格 DNA + 用户反馈一起送给模型
  const userMessage = [
    '【当前场景描述】',
    scenePrompt?.trim() || '（暂无场景描述）',
    '',
    '【品牌风格 DNA（只作参考，不要纳入场景描述输出）】',
    styleDNA?.trim() || '（暂无）',
    '',
    '【用户调整需求】',
    userFeedback.trim(),
    '',
    '请基于以上信息，输出优化后的场景描述提示词（英文，仅提示词本体，不含风格 DNA）：',
  ].join('\n')

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      { role: 'user', parts: [{ text: userMessage }] },
    ],
    generationConfig: {
      thinkingConfig: {
        // high = 深度思考，充分分析视觉需求再输出
        thinkingLevel: 'high',
      },
      temperature: 1,   // thinking 模式官方推荐 temperature=1
    },
  }

  try {
    const geminiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}))
      const msg = (errData as { error?: { message?: string } }).error?.message
        ?? `Gemini API 错误 ${geminiRes.status}`
      return NextResponse.json({ error: msg }, { status: geminiRes.status })
    }

    const data = await geminiRes.json()
    const parts: GeminiPart[] = data.candidates?.[0]?.content?.parts ?? []

    // thinking 模式下 parts 包含思考过程（thought: true）和最终回答
    // 只取非 thought 的文本 part
    const textPart = parts.find(p => p.text && !p.thought)
    if (!textPart?.text) {
      return NextResponse.json({ error: '模型未返回有效内容' }, { status: 500 })
    }

    return NextResponse.json({ refinedPrompt: textPart.text.trim() })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '网络请求失败' },
      { status: 500 },
    )
  }
}
