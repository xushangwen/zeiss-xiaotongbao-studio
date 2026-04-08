'use client'
import { useState, useEffect, useCallback } from 'react'
import Topbar from './Topbar'
import CardLibrary from './CardLibrary'
import StyleDNA from './StyleDNA'
import ParamControls from './ParamControls'
import PromptWorkspace from './PromptWorkspace'
import ResultsPanel from './ResultsPanel'
import ToastList from './ToastList'
import { useToast } from '@/hooks/useToast'
import { CARDS } from '@/lib/cards'
import { DEFAULT_STYLE_DNA, RATIO_HINTS } from '@/lib/constants'
import { dbSave, dbLoadAll, dbDelete, dbClear } from '@/lib/db'
import type { AspectRatio, Resolution, HistoryItem } from '@/lib/types'

const LS_DNA    = 'zeiss_style_dna'
const LS_LOCKED = 'zeiss_style_locked'

export default function Studio() {
  const { toasts, addToast } = useToast()

  // ── 状态 ─────────────────────────────────────
  const [styleDNA,       setStyleDNA]       = useState(DEFAULT_STYLE_DNA)
  const [isStyleLocked,  setIsStyleLocked]  = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null)
  const [scenePrompt,    setScenePrompt]    = useState('')
  const [aspectRatio,    setAspectRatio]    = useState<AspectRatio>('16:9')
  const [resolution,     setResolution]     = useState<Resolution>('standard')
  const [isGenerating,   setIsGenerating]   = useState(false)
  const [isRefining,     setIsRefining]     = useState(false)
  const [history,        setHistory]        = useState<HistoryItem[]>([])
  const [currentIdx,     setCurrentIdx]     = useState(-1)
  const [error,          setError]          = useState<string | null>(null)
  const [refineError,    setRefineError]    = useState<string | null>(null)

  // ── 初始化：LocalStorage + IndexedDB 历史 ────
  useEffect(() => {
    const savedDNA    = localStorage.getItem(LS_DNA)
    const savedLocked = localStorage.getItem(LS_LOCKED) === 'true'
    if (savedDNA)    setStyleDNA(savedDNA)
    if (savedLocked) setIsStyleLocked(true)

    // 从 IndexedDB 恢复历史记录
    dbLoadAll().then(items => {
      if (items.length > 0) {
        setHistory(items)
        setCurrentIdx(0)
      }
    }).catch(() => { /* IndexedDB 不可用时静默降级 */ })
  }, [])

  // ── 持久化 ───────────────────────────────────
  useEffect(() => { localStorage.setItem(LS_DNA, styleDNA) }, [styleDNA])
  useEffect(() => { localStorage.setItem(LS_LOCKED, String(isStyleLocked)) }, [isStyleLocked])

  // ── 键盘快捷键 ───────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !isGenerating) {
        handleGenerate()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, scenePrompt, styleDNA, aspectRatio, resolution])

  // ── 构建完整提示词 ────────────────────────────
  // 分辨率不注入提示词（模型输出尺寸固定），仅在导出时通过 Canvas 缩放实现
  const buildFullPrompt = useCallback(() => {
    const parts: string[] = []
    if (scenePrompt.trim()) parts.push(scenePrompt.trim())
    if (styleDNA.trim())    parts.push(`[Style]: ${styleDNA.trim()}`)
    const rh = RATIO_HINTS[aspectRatio]
    if (rh) parts.push(`[Composition]: ${rh}`)
    return parts.join('. ')
  }, [scenePrompt, styleDNA, aspectRatio])

  // ── 卡片选择 ─────────────────────────────────
  function handleCardSelect(id: number) {
    setSelectedCardId(id)
    const card = CARDS.find(c => c.id === id)
    if (card) setScenePrompt(card.prompt)
  }

  // ── 风格锁定 ─────────────────────────────────
  function handleToggleLock() {
    const next = !isStyleLocked
    setIsStyleLocked(next)
    addToast(
      next ? '风格 DNA 已锁定 🔒 所有卡片将使用此风格' : '风格 DNA 已解锁，可自由编辑',
      next ? 'success' : 'info',
    )
  }

  function handleResetDNA() {
    if (isStyleLocked) { addToast('请先解锁风格再重置', 'error'); return }
    setStyleDNA(DEFAULT_STYLE_DNA)
    addToast('已恢复默认风格 DNA')
  }

  // ── 提示词增强 ───────────────────────────────
  function handleEnhance() {
    if (!scenePrompt.trim()) { addToast('请先输入场景描述', 'error'); return }
    const pools = [
      'clean composition with clear focal point',
      'balanced use of negative space',
      'readable at small card size',
      'high contrast between characters and background',
      'consistent character design',
      'bright cheerful lighting',
      'warm and friendly atmosphere',
    ]
    const picks = pools.sort(() => Math.random() - 0.5).slice(0, 3)
    setScenePrompt(prev => prev.trimEnd() + '. ' + picks.join(', ') + '.')
    addToast('提示词已增强 ✨', 'success')
  }

  // ── 清空 ─────────────────────────────────────
  function handleClear() {
    setScenePrompt('')
    setSelectedCardId(null)
  }

  // ── 复制 ─────────────────────────────────────
  function handleCopyPrompt() {
    navigator.clipboard.writeText(buildFullPrompt()).then(() => {
      addToast('提示词已复制到剪贴板', 'success')
    })
  }

  // ── AI 深度优化提示词 ─────────────────────────
  async function handleRefine(feedback: string) {
    if (!feedback.trim()) return
    setIsRefining(true)
    setRefineError(null)

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenePrompt,
          styleDNA,
          userFeedback: feedback,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || `服务器错误 ${res.status}`)

      setScenePrompt(data.refinedPrompt)
      addToast('提示词已优化 ✦', 'success')

    } catch (err) {
      const msg = err instanceof Error ? err.message : '优化失败'
      setRefineError(msg)
      addToast('提示词优化失败', 'error')
    } finally {
      setIsRefining(false)
    }
  }

  // ── 核心：生成图片 ────────────────────────────
  async function handleGenerate() {
    if (!scenePrompt.trim()) { addToast('请先输入场景描述', 'error'); return }
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: buildFullPrompt(),
          aspectRatio,
          resolution,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || `服务器错误 ${res.status}`)
      }

      const item: HistoryItem = {
        id: Date.now(),
        dataUrl: data.dataUrl,
        cardNum: selectedCardId !== null ? `No.${selectedCardId}` : '自定义',
        timestamp: new Date().toLocaleTimeString('zh-CN'),
        resolution,
        fullPrompt: buildFullPrompt(),
      }

      // 持久化到 IndexedDB
      dbSave(item).catch(() => { /* 存储失败时不中断主流程 */ })

      setHistory(prev => [item, ...prev])
      setCurrentIdx(0)
      addToast('生成成功！', 'success')

    } catch (err) {
      const msg = err instanceof Error ? err.message : '未知错误'
      setError(msg)
      addToast('生成失败', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // ── 渲染 ─────────────────────────────────────
  return (
    <div
      className="grid h-screen overflow-hidden bg-bg text-tx font-sans"
      style={{ gridTemplateColumns: '268px 340px 1fr', gridTemplateRows: '48px 1fr' }}
    >
      {/* 顶部栏：横跨3列 */}
      <Topbar />

      {/* 左侧边栏 */}
      <aside className="flex flex-col overflow-hidden bg-surface border-r border-border">
        <CardLibrary selectedId={selectedCardId} onSelect={handleCardSelect} />
        <StyleDNA
          value={styleDNA}
          locked={isStyleLocked}
          onChange={setStyleDNA}
          onToggleLock={handleToggleLock}
          onReset={handleResetDNA}
        />
        <ParamControls
          aspectRatio={aspectRatio}
          onRatioChange={setAspectRatio}
          resolution={resolution}
          onResChange={setResolution}
        />
      </aside>

      {/* 中间：提示词工作区 */}
      <PromptWorkspace
        styleDNA={styleDNA}
        isStyleLocked={isStyleLocked}
        scenePrompt={scenePrompt}
        fullPrompt={buildFullPrompt()}
        isGenerating={isGenerating}
        isRefining={isRefining}
        error={error}
        refineError={refineError}
        onSceneChange={setScenePrompt}
        onGenerate={handleGenerate}
        onClear={handleClear}
        onEnhance={handleEnhance}
        onCopyPrompt={handleCopyPrompt}
        onRefine={handleRefine}
      />

      {/* 右侧：结果区 */}
      <ResultsPanel
        history={history}
        currentIdx={currentIdx}
        onSelectHistory={setCurrentIdx}
        onRestorePrompt={(fullPrompt) => {
          // 只回填场景部分，[Style] 和 [Composition] 由系统自动附加
          const sceneOnly = fullPrompt
            .replace(/\.\s*\[Style\]:[\s\S]*?(?=\.\s*\[|$)/, '')
            .replace(/\.\s*\[Composition\]:[\s\S]*?(?:\.|$)/, '')
            .replace(/\.$/, '')
            .trim()
          setScenePrompt(sceneOnly)
          addToast('提示词已回填到编辑区', 'info')
        }}
        onDeleteItem={(id) => {
          setHistory(prev => {
            const deletedIdx = prev.findIndex(item => item.id === id)
            const next = prev.filter(item => item.id !== id)
            if (next.length === 0) {
              setCurrentIdx(-1)
            } else if (deletedIdx === currentIdx) {
              setCurrentIdx(Math.min(currentIdx, next.length - 1))
            } else if (deletedIdx < currentIdx) {
              setCurrentIdx(currentIdx - 1)
            }
            return next
          })
          dbDelete(id).catch(() => {})
        }}
        onClearHistory={() => {
          setHistory([])
          setCurrentIdx(-1)
          dbClear().catch(() => {})
          addToast('历史记录已清空')
        }}
      />

      {/* Toast 通知 */}
      <ToastList toasts={toasts} />
    </div>
  )
}
