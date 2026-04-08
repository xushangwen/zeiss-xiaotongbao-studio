'use client'
import { useState, useCallback } from 'react'
import type { ToastItem } from '@/lib/types'

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2600)
  }, [])

  return { toasts, addToast }
}
