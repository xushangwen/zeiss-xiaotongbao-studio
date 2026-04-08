import { NextRequest, NextResponse } from 'next/server'

const MODEL = 'gemini-3.1-flash-image-preview'

// Gemini API 返回的 part 结构
interface GeminiPart {
  text?: string
  inlineData?: { mimeType: string; data: string }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY 未配置' }, { status: 500 })
  }

  const body = await req.json()
  const { prompt, aspectRatio, resolution } = body as {
    prompt: string
    aspectRatio?: string
    resolution?: 'standard' | '2k' | '4k'
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: '提示词不能为空' }, { status: 400 })
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

  // 映射前端 resolution → Gemini imageSize（必须大写 K；'512' 无后缀）
  const IMAGE_SIZE: Record<'standard' | '2k' | '4k', string> = {
    standard: '1K',
    '2k':     '2K',
    '4k':     '4K',
  }
  const imageSize = IMAGE_SIZE[resolution ?? 'standard']

  const requestBody = {
    contents: [{ parts: [{ text: prompt }], role: 'user' }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      // imageConfig 控制分辨率和宽高比
      imageConfig: {
        imageSize,
        ...(aspectRatio ? { aspectRatio } : {}),
      },
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

    const imgPart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))
    if (!imgPart?.inlineData) {
      const textPart = parts.find(p => p.text)
      const hint = textPart?.text ? `：${textPart.text.slice(0, 120)}` : ''
      return NextResponse.json(
        { error: `模型未返回图片${hint}` },
        { status: 500 },
      )
    }

    return NextResponse.json({
      dataUrl: `data:${imgPart.inlineData.mimeType};base64,${imgPart.inlineData.data}`,
      mimeType: imgPart.inlineData.mimeType,
    })

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : '网络请求失败' },
      { status: 500 },
    )
  }
}
