'use client'
import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  styleDNA: string
  isStyleLocked: boolean
  scenePrompt: string
  fullPrompt: string
  isGenerating: boolean
  isRefining: boolean
  error: string | null
  refineError: string | null
  onSceneChange: (v: string) => void
  onGenerate: () => void
  onClear: () => void
  onEnhance: () => void
  onCopyPrompt: () => void
  onRefine: (feedback: string) => void
}

export default function PromptWorkspace({
  styleDNA, isStyleLocked, scenePrompt, fullPrompt,
  isGenerating, isRefining, error, refineError,
  onSceneChange, onGenerate, onClear, onEnhance, onCopyPrompt, onRefine,
}: Props) {
  const [showFull, setShowFull]       = useState(false)
  const [feedback, setFeedback]       = useState('')

  return (
    <div className="flex flex-col overflow-hidden bg-bg">

      {/* 主体内容区 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* DNA 预览条 */}
        <div
          className={clsx(
            'rounded-md border-l-[3px] border border-border px-3 py-2.5',
            isStyleLocked ? 'border-l-ok bg-s3' : 'border-l-accent bg-s3',
          )}
        >
          <div
            className={clsx(
              'flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase mb-1',
              isStyleLocked ? 'text-green-400' : 'text-accent-light',
            )}
          >
            <i className={isStyleLocked ? 'ri-lock-2-fill' : 'ri-shield-star-line'} />
            风格 DNA {isStyleLocked ? '（已锁定·自动附加）' : '（未锁定）'}
          </div>
          <p className="text-[11px] text-tx-muted leading-relaxed line-clamp-2">
            {styleDNA || '尚未设置风格 DNA'}
          </p>
        </div>

        {/* 场景描述 */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim flex-1">
              场景描述
            </span>
            <button
              onClick={onEnhance}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-border text-tx-muted text-[12px] hover:bg-s2 hover:text-tx transition-all"
            >
              <i className="ri-magic-line" /> 优化提示词
            </button>
            <button
              onClick={onClear}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-tx-muted text-[12px] hover:bg-s2 hover:text-tx transition-all"
              title="清空"
            >
              <i className="ri-delete-bin-line" />
            </button>
          </div>

          <textarea
            value={scenePrompt}
            onChange={e => onSceneChange(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-[10px] border border-border bg-surface text-tx text-[13px] leading-[1.75] p-3 outline-none focus:border-accent-light transition-colors placeholder:text-tx-dim"
            placeholder={`描述你想要的画面场景...\n\n从左侧点击卡片可自动填入预设提示词，\n也可以直接在这里输入或修改。\n\n建议用英文描述以获得最佳效果。\n\n⌘ + Enter 快速生成`}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="rounded-[10px] border border-red-800/40 bg-red-950/30 px-3 py-2.5 text-[12px] text-red-400 leading-relaxed">
            <i className="ri-alert-line mr-1.5" />
            {error}
          </div>
        )}

        {/* AI 提示词优化 */}
        <div className="space-y-2 rounded-[10px] border border-border bg-s2 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-accent-light">
            <i className="ri-brain-line" />
            AI 深度优化提示词
          </div>
          <p className="text-[11px] text-tx-dim leading-relaxed">
            描述你对上次生成结果的不满之处，AI 将深度分析后重整提示词
          </p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={3}
            disabled={isRefining}
            className="w-full resize-none rounded-md border border-border bg-surface text-tx text-[12px] leading-[1.7] p-2.5 outline-none focus:border-accent-light transition-colors placeholder:text-tx-dim disabled:opacity-50"
            placeholder={`例：\n· 去掉眼镜，孩子改成侧面站姿\n· 背景太空旷，加一些书架元素`}
          />
          {refineError && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <i className="ri-alert-line" />{refineError}
            </p>
          )}
          <button
            onClick={() => { onRefine(feedback); setFeedback('') }}
            disabled={isRefining || !feedback.trim()}
            className={clsx(
              'w-full flex items-center justify-center gap-2 py-2 rounded-md text-[13px] font-semibold transition-all',
              isRefining || !feedback.trim()
                ? 'bg-s3 text-tx-dim cursor-not-allowed'
                : 'bg-accent/15 border border-accent/40 text-accent-light hover:bg-accent/25 hover:border-accent-light',
            )}
          >
            {isRefining ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin-slow" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
                </svg>
                深度思考中...
              </>
            ) : (
              <>
                <i className="ri-sparkling-line" />
                AI 重整提示词
              </>
            )}
          </button>
        </div>

        {/* 完整提示词预览（可展开） */}
        <div className="space-y-1.5">
          <button
            onClick={() => setShowFull(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border border-dashed border-border text-tx-muted text-[11px] hover:border-border-light hover:text-tx transition-all"
          >
            <i className="ri-eye-line" />
            <span>预览完整提示词（发送给模型的内容）</span>
            <i className={clsx('ml-auto', showFull ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line')} />
          </button>
          {showFull && (
            <pre className="rounded-md border border-border bg-s2 p-3 text-[11px] text-tx-muted leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-32">
              {fullPrompt || '（提示词为空）'}
            </pre>
          )}
        </div>

      </div>

      {/* 底部操作栏 */}
      <div className="border-t border-border px-4 py-3 flex gap-2.5 bg-surface">
        <button
          onClick={onCopyPrompt}
          title="复制完整提示词"
          className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-tx-muted hover:bg-s2 hover:text-tx transition-all text-[15px]"
        >
          <i className="ri-file-copy-line" />
        </button>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all',
            isGenerating
              ? 'bg-s3 text-tx-dim cursor-not-allowed'
              : 'bg-accent hover:bg-accent-h text-white hover:-translate-y-px hover:shadow-lg hover:shadow-accent-glow active:translate-y-0',
          )}
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
              </svg>
              生成中...
            </>
          ) : (
            <>
              <i className="ri-sparkling-2-line" />
              生成插画
            </>
          )}
        </button>
      </div>
    </div>
  )
}
