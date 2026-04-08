'use client'
import clsx from 'clsx'
import {
  ASPECT_RATIOS, RESOLUTIONS,
  RATIO_LABELS, RES_LABELS,
} from '@/lib/constants'
import type { AspectRatio, Resolution } from '@/lib/types'

interface Props {
  aspectRatio: AspectRatio
  onRatioChange: (r: AspectRatio) => void
  resolution: Resolution
  onResChange: (r: Resolution) => void
}

export default function ParamControls({ aspectRatio, onRatioChange, resolution, onResChange }: Props) {
  return (
    <div className="px-3 py-3 border-t border-border space-y-3">
      {/* Aspect ratio */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim">宽高比</p>
        <div className="grid grid-cols-4 gap-1">
          {ASPECT_RATIOS.map(r => (
            <button
              key={r}
              onClick={() => onRatioChange(r)}
              className={clsx(
                'py-1.5 rounded-md border text-center text-[11px] transition-all',
                aspectRatio === r
                  ? 'bg-accent border-accent text-white font-semibold'
                  : 'bg-s2 border-border text-tx-muted hover:border-border-light hover:text-tx',
              )}
            >
              <div>{RATIO_LABELS[r].top}</div>
              <div className="text-[9px] opacity-60">{RATIO_LABELS[r].sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim">画质提示</p>
        <div className="grid grid-cols-3 gap-1">
          {RESOLUTIONS.map(r => (
            <button
              key={r}
              onClick={() => onResChange(r)}
              className={clsx(
                'py-1.5 rounded-md border text-center transition-all',
                resolution === r
                  ? 'bg-accent border-accent text-white font-semibold'
                  : 'bg-s2 border-border text-tx-muted hover:border-border-light hover:text-tx',
              )}
            >
              <div className="text-[11px]">{RES_LABELS[r].label}</div>
              <div className="text-[9px] opacity-60">{RES_LABELS[r].sub}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
