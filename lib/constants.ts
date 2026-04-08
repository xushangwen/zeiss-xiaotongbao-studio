import type { AspectRatio, Resolution } from './types'

export const DEFAULT_STYLE_DNA =
  'Flat vector cartoon illustration, clean rounded black outlines with consistent stroke weight, ' +
  'bright optimistic color palette, ZEISS royal blue (#0047AB) as primary brand color, ' +
  'sky blue for backgrounds, warm yellow-orange accents, cute Asian child characters aged 8-12 ' +
  'with round expressive faces wearing glasses, simple geometric background elements, ' +
  'modern educational infographic aesthetic, no photorealism, ' +
  'child-friendly professional illustration style, no text in image'

export const RATIO_HINTS: Record<AspectRatio, string> = {
  '9:16': 'portrait orientation vertical composition, tall 9:16 format, suitable for card layout',
  '1:1':  'square composition, 1:1 aspect ratio, balanced layout',
  '16:9': 'landscape orientation horizontal composition, wide 16:9 format',
  '4:3':  'standard horizontal composition, 4:3 aspect ratio',
}

export const RATIO_LABELS: Record<AspectRatio, { top: string; sub: string }> = {
  '9:16': { top: '9:16', sub: '竖版' },
  '1:1':  { top: '1:1',  sub: '方形' },
  '16:9': { top: '16:9', sub: '横版' },
  '4:3':  { top: '4:3',  sub: '标准' },
}

// 模型输出分辨率固定，2K/4K 在导出时通过 Canvas 缩放实现，不注入提示词
export const RES_EXPORT_LONG_EDGE: Record<Resolution, number> = {
  standard: 0,     // 0 = 保持原始尺寸不缩放
  '2k':     2560,  // 长边缩放到 2560px（16:9 → 2560×1440）
  '4k':     3840,  // 长边缩放到 3840px（16:9 → 3840×2160）
}

export const RES_LABELS: Record<Resolution, { label: string; sub: string }> = {
  standard: { label: '原始',   sub: '模型输出' },
  '2k':     { label: '2K 导出', sub: '≈2560px' },
  '4k':     { label: '4K 导出', sub: '≈3840px' },
}

export const ASPECT_RATIOS: AspectRatio[] = ['9:16', '1:1', '16:9', '4:3']
export const RESOLUTIONS: Resolution[]    = ['standard', '2k', '4k']
