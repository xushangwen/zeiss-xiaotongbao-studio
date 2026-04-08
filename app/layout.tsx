import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZEISS 小瞳堡 · AI 生图工作台',
  description: '蔡司小瞳堡镜片安心配戴指南插画生成工具',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+SC:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
