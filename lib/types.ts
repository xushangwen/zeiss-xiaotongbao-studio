export interface Card {
  id: number
  num: string
  title: string
  subtitle: string
  prompt: string
}

export interface HistoryItem {
  id: number
  dataUrl: string
  cardNum: string
  timestamp: string
  resolution: Resolution  // 存储生成时选中的导出分辨率
}

export type AspectRatio = '9:16' | '1:1' | '16:9' | '4:3'
export type Resolution  = 'standard' | '2k' | '4k'

export interface ToastItem {
  id: number
  message: string
  type: 'info' | 'success' | 'error'
}
