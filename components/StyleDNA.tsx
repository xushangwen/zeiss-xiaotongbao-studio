'use client'
import clsx from 'clsx'
import { DEFAULT_STYLE_DNA } from '@/lib/constants'

interface Props {
  value: string
  locked: boolean
  onChange: (v: string) => void
  onToggleLock: () => void
  onReset: () => void
}

export default function StyleDNA({ value, locked, onChange, onToggleLock, onReset }: Props) {
  return (
    <div className="px-3 py-3 border-t border-border space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim flex-1">
          风格 DNA
        </span>
        <div
          className={clsx(
            'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
            locked
              ? 'bg-ok-bg text-green-400'
              : 'bg-white/5 text-tx-muted',
          )}
        >
          <i className={locked ? 'ri-lock-2-fill' : 'ri-lock-unlock-line'} />
          {locked ? '已锁定' : '未锁定'}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={locked}
        rows={4}
        className={clsx(
          'w-full resize-none rounded-md border text-[11px] leading-relaxed p-2 transition-colors outline-none',
          locked
            ? 'bg-s3 border-border text-tx-muted cursor-default'
            : 'bg-s2 border-border focus:border-accent-light text-tx',
        )}
        placeholder="输入风格提示词，锁定后所有卡片将共用此风格..."
      />

      <p className="text-[10px] text-tx-dim">先生成测试图，满意后点击「锁定风格」</p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onReset}
          disabled={locked}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-border text-tx-muted text-[12px] hover:bg-s2 hover:text-tx transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <i className="ri-refresh-line" /> 重置
        </button>
        <button
          onClick={onToggleLock}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all',
            locked
              ? 'bg-ok-bg border border-green-800/40 text-green-400 hover:bg-green-950/40'
              : 'border border-border text-tx-muted hover:bg-s2 hover:text-tx',
          )}
        >
          <i className={locked ? 'ri-lock-2-fill' : 'ri-lock-line'} />
          {locked ? '解锁编辑' : '锁定风格'}
        </button>
      </div>
    </div>
  )
}
