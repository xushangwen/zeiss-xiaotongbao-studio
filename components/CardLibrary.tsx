'use client'
import clsx from 'clsx'
import { CARDS } from '@/lib/cards'

interface Props {
  selectedId: number | null
  onSelect: (id: number) => void
}

export default function CardLibrary({ selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-0.5 py-2 px-3 overflow-y-auto flex-1">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-tx-dim px-1 pb-1">
        卡片库 · 9张
      </p>
      {CARDS.map(card => (
        <button
          key={card.id}
          onClick={() => onSelect(card.id)}
          className={clsx(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-md border text-left transition-all',
            selectedId === card.id
              ? 'bg-accent-glow border-accent'
              : 'border-transparent hover:bg-s2 hover:border-border',
          )}
        >
          <div
            className={clsx(
              'w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold font-grotesk flex-shrink-0 transition-all',
              selectedId === card.id ? 'bg-accent text-white' : 'bg-s3 text-tx-muted',
            )}
          >
            {card.id}
          </div>
          <div className="min-w-0">
            <div className="text-[12px] font-medium text-tx truncate">
              {card.num} · {card.title}
            </div>
            <div className="text-[11px] text-tx-muted truncate">{card.subtitle}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
