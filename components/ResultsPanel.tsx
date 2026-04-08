'use client'
import clsx from 'clsx'
import { RES_EXPORT_LONG_EDGE } from '@/lib/constants'
import type { HistoryItem } from '@/lib/types'

interface Props {
  history: HistoryItem[]
  currentIdx: number
  onSelectHistory: (idx: number) => void
  onClearHistory: () => void
}

export default function ResultsPanel({ history, currentIdx, onSelectHistory, onClearHistory }: Props) {
  const current = history[currentIdx] ?? null

  // 下载逻辑：
  // 1. Canvas 重绘 → JPEG blob，修复 macOS QuickLook 缩略图问题
  // 2. 按生成时选定的分辨率缩放长边（2K=2560px / 4K=3840px），原始则不缩放
  // 注：Gemini 模型输出尺寸固定（约 1376×768），2K/4K 是导出阶段的 Canvas 缩放
  async function download() {
    if (!current) return

    const img = new Image()
    img.src = current.dataUrl
    await new Promise<void>(resolve => { img.onload = () => resolve() })

    const nativeW   = img.naturalWidth
    const nativeH   = img.naturalHeight
    const targetEdge = RES_EXPORT_LONG_EDGE[current.resolution ?? 'standard']

    let exportW = nativeW
    let exportH = nativeH
    if (targetEdge > 0) {
      const scale = targetEdge / Math.max(nativeW, nativeH)
      exportW = Math.round(nativeW * scale)
      exportH = Math.round(nativeH * scale)
    }

    const canvas = document.createElement('canvas')
    canvas.width  = exportW
    canvas.height = exportH
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, exportW, exportH)

    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      const ts  = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')
      a.download = `zeiss-${current.cardNum}-${ts}.jpg`
      a.href = url
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/jpeg', 0.95)
  }

  function openFullscreen() {
    if (!current) return
    const w = window.open('', '_blank')!
    w.document.write(
      `<html><head><title>ZEISS 插画预览</title>` +
      `<style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh}` +
      `img{max-width:100vw;max-height:100vh;object-fit:contain}</style></head>` +
      `<body><img src="${current.dataUrl}"></body></html>`
    )
  }

  return (
    <div className="flex flex-col overflow-hidden bg-surface border-l border-border">

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <span className="text-[12px] font-semibold text-tx flex-1">生成结果</span>
        <span className="px-2 py-0.5 bg-s3 rounded-full text-[10px] text-tx-muted font-grotesk">
          {history.length} 张
        </span>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            title="清空历史"
            className="w-7 h-7 flex items-center justify-center rounded-md border border-border text-tx-muted hover:bg-s2 hover:text-tx transition-all text-[14px]"
          >
            <i className="ri-delete-bin-line" />
          </button>
        )}
      </div>

      {/* 主图展示区 */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
        {current ? (
          <div className="relative flex items-center justify-center w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.dataUrl}
              alt="生成结果"
              className="max-w-full max-h-full object-contain rounded-[10px] shadow-2xl"
            />
            {/* 悬浮操作按钮 */}
            <div className="absolute bottom-2 right-2 flex gap-1.5">
              <button
                onClick={download}
                title="下载"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-s3/80 backdrop-blur border border-border text-tx-muted hover:text-tx hover:bg-s3 transition-all text-[15px]"
              >
                <i className="ri-download-line" />
              </button>
              <button
                onClick={openFullscreen}
                title="全屏查看"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-s3/80 backdrop-blur border border-border text-tx-muted hover:text-tx hover:bg-s3 transition-all text-[15px]"
              >
                <i className="ri-fullscreen-line" />
              </button>
            </div>
            {/* 卡片信息 */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-s3/80 backdrop-blur border border-border text-[10px] text-tx-muted">
              {current.cardNum} · {current.timestamp}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-tx-dim">
            <i className="ri-image-line text-4xl opacity-30" />
            <p className="text-[13px] text-center leading-relaxed">
              点击「生成插画」<br />结果将显示在这里
            </p>
          </div>
        )}
      </div>

      {/* 历史缩略图 */}
      {history.length > 0 && (
        <div className="border-t border-border p-3 flex-shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim mb-2">
            本次会话历史
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {history.map((item, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                src={item.dataUrl}
                alt={item.cardNum}
                title={`${item.cardNum} · ${item.timestamp}`}
                onClick={() => onSelectHistory(idx)}
                className={clsx(
                  'w-14 h-[72px] object-cover rounded-md cursor-pointer border-2 transition-all',
                  idx === currentIdx
                    ? 'border-accent opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-90 hover:border-accent-light',
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
