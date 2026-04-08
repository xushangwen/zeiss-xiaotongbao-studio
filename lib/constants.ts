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

export const RES_LABELS: Record<Resolution, { label: string; sub: string }> = {
  standard: { label: '标准', sub: '1K' },
  '2k':     { label: '高清', sub: '2K' },
  '4k':     { label: '超清', sub: '4K' },
}

export const ASPECT_RATIOS: AspectRatio[] = ['9:16', '1:1', '16:9', '4:3']
export const RESOLUTIONS: Resolution[]    = ['standard', '2k', '4k']
