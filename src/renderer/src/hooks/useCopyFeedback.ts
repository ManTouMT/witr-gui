import { useState, useCallback, useRef } from 'react'
import { useAppStore } from '../stores/useAppStore'

export const useCopyFeedback = (timeout = 2000) => {
  const { copyText } = useAppStore()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyWithFeedback = useCallback(
    (key: string, text: string) => {
      copyText(text)
      setCopiedKey(key)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setCopiedKey(null)
      }, timeout)
    },
    [copyText, timeout]
  )

  const isCopied = useCallback((key: string) => copiedKey === key, [copiedKey])

  return {
    copiedKey,
    copyWithFeedback,
    isCopied
  }
}
