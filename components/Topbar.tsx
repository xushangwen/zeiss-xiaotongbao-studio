'use client'

export default function Topbar() {
  return (
    <header className="col-span-3 flex items-center gap-3 px-4 bg-surface border-b border-border z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 font-grotesk font-bold text-[15px] tracking-tight">
        <div className="w-6 h-6 bg-zeiss rounded-[5px] flex items-center justify-center text-[11px] font-extrabold text-white tracking-tighter">
          Z
        </div>
        ZEISS 小瞳堡
      </div>

      <div className="w-px h-5 bg-border" />
      <span className="text-tx-muted text-[12px]">AI 插画生图工作台</span>

      <div className="flex-1" />

      <div className="flex items-center gap-2 px-3 py-1 bg-s2 border border-border rounded-full text-[11px] text-tx-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse-dot" />
        gemini-3.1-flash-image-preview
      </div>
    </header>
  )
}
