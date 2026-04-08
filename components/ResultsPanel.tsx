'use client'
import { useState } from 'react'
import clsx from 'clsx'
import type { HistoryItem } from '@/lib/types'

interface Props {
  history: HistoryItem[]
  currentIdx: number
  onSelectHistory: (idx: number) => void
  onDeleteItem: (id: number) => void
  onClearHistory: () => void
  onRestorePrompt: (prompt: string) => void  // 回填提示词到编辑区
}

// 把完整提示词拆分为三段，方便高亮展示
function parsePromptSegments(full: string) {
  const styleMatch = full.match(/\[Style\]:\s*([\s\S]*?)(?=\.\s*\[|$)/)
  const compMatch  = full.match(/\[Composition\]:\s*([\s\S]*?)(?:\.|$)/)

  const styleStr = styleMatch?.[1]?.trim() ?? ''
  const compStr  = compMatch?.[1]?.trim() ?? ''

  // scene = 去掉 [Style] 和 [Composition] 两段后剩余的部分
  let scene = full
  if (styleStr) scene = scene.replace(/\.\s*\[Style\]:[\s\S]*?(?=\.\s*\[|$)/, '')
  if (compStr)  scene = scene.replace(/\.\s*\[Composition\]:[\s\S]*?(?:\.|$)/, '')
  scene = scene.replace(/\.$/, '').trim()

  return { scene, style: styleStr, composition: compStr }
}

export default function ResultsPanel({
  history, currentIdx, onSelectHistory, onDeleteItem, onClearHistory, onRestorePrompt,
}: Props) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [copied,     setCopied]     = useState(false)

  const current = history[currentIdx] ?? null

  // 下载逻辑：Canvas 重绘 → JPEG blob，修复 macOS QuickLook 缩略图问题
  async function download() {
    if (!current) return

    const img = new Image()
    img.src = current.dataUrl
    await new Promise<void>(resolve => { img.onload = () => resolve() })

    const canvas = document.createElement('canvas')
    canvas.width  = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)

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

  function copyPrompt() {
    if (!current?.fullPrompt) return
    navigator.clipboard.writeText(current.fullPrompt).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const segments = current?.fullPrompt ? parsePromptSegments(current.fullPrompt) : null

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
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative min-h-0">
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
              {/* 查看提示词 */}
              <button
                onClick={() => setShowPrompt(v => !v)}
                title="查看提示词"
                className={clsx(
                  'w-8 h-8 flex items-center justify-center rounded-md backdrop-blur border transition-all text-[15px]',
                  showPrompt
                    ? 'bg-accent border-accent text-white'
                    : 'bg-s3/80 border-border text-tx-muted hover:text-tx hover:bg-s3',
                )}
              >
                <i className="ri-file-text-line" />
              </button>
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
              {current.cardNum} · {current.timestamp} · {current.resolution.toUpperCase()}
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

      {/* 提示词详情面板 */}
      {showPrompt && current && (
        <div className="border-t border-border flex-shrink-0 bg-bg">
          {/* 面板 header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <i className="ri-file-text-line text-[11px] text-accent-light" />
            <span className="text-[11px] font-semibold text-tx flex-1">本图使用的完整提示词</span>
            <button
              onClick={() => { if (current.fullPrompt) onRestorePrompt(current.fullPrompt) }}
              title="回填到编辑区"
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-border text-[10px] text-tx-muted hover:bg-s2 hover:text-tx transition-all"
            >
              <i className="ri-arrow-go-back-line" /> 回填
            </button>
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-border text-[10px] text-tx-muted hover:bg-s2 hover:text-tx transition-all"
            >
              <i className={copied ? 'ri-check-line text-green-400' : 'ri-file-copy-line'} />
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          {/* 分段展示 */}
          {segments ? (
            <div className="p-3 space-y-2 max-h-44 overflow-y-auto">
              {segments.scene && (
                <div>
                  <span className="inline-block text-[9px] font-semibold tracking-widest uppercase text-tx-dim mb-1">场景描述</span>
                  <p className="text-[11px] text-tx leading-relaxed">{segments.scene}</p>
                </div>
              )}
              {segments.style && (
                <div className="rounded-md border-l-2 border-l-accent bg-accent/5 px-2.5 py-2">
                  <span className="inline-block text-[9px] font-semibold tracking-widest uppercase text-accent-light mb-1">
                    风格 DNA ✓ 已注入
                  </span>
                  <p className="text-[10px] text-tx-muted leading-relaxed">{segments.style}</p>
                </div>
              )}
              {segments.composition && (
                <div>
                  <span className="inline-block text-[9px] font-semibold tracking-widest uppercase text-tx-dim mb-1">构图指令</span>
                  <p className="text-[11px] text-tx-muted leading-relaxed">{segments.composition}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="p-3 text-[11px] text-tx-dim">（旧记录，无提示词存档）</p>
          )}
        </div>
      )}

      {/* 历史缩略图 */}
      {history.length > 0 && (
        <div className="border-t border-border p-3 flex-shrink-0">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim mb-2">
            本次会话历史
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
            {history.map((item, idx) => (
              <div key={item.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.dataUrl}
                  alt={item.cardNum}
                  title={item.fullPrompt
                    ? `${item.cardNum} · ${item.timestamp}\n\n${item.fullPrompt.slice(0, 120)}...`
                    : `${item.cardNum} · ${item.timestamp}`}
                  onClick={() => onSelectHistory(idx)}
                  className={clsx(
                    'w-14 h-[72px] object-cover rounded-md cursor-pointer border-2 transition-all',
                    idx === currentIdx
                      ? 'border-accent opacity-100'
                      : 'border-transparent opacity-60 hover:opacity-90 hover:border-accent-light',
                  )}
                />
                {/* hover 删除按钮 */}
                <button
                  onClick={e => { e.stopPropagation(); onDeleteItem(item.id) }}
                  title="删除"
                  className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-600 text-white text-[9px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="ri-close-line" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
