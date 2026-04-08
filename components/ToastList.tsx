'use client'
import clsx from 'clsx'
import type { ToastItem } from '@/lib/types'

export default function ToastList({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={clsx(
            'animate-slide-in px-4 py-2.5 rounded-[10px] text-[13px] font-medium shadow-xl pointer-events-auto',
            t.type === 'success' && 'bg-ok-bg border border-green-800/40 text-green-400',
            t.type === 'error'   && 'bg-red-950/80 border border-red-800/40 text-red-400',
            t.type === 'info'    && 'bg-s3 border border-border-light text-tx',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
