import React, { useMemo } from 'react'
import { useAppStore } from '../../../stores/useAppStore'
import { useCopyFeedback } from '../../../hooks/useCopyFeedback'
import { Code, Copy, Check } from 'lucide-react'

// Token Regex for matching JSON keys, strings, numbers, booleans, nulls
const TOKEN_REGEX = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g

const HighlightedJson: React.FC<{ json: any }> = ({ json }) => {
  const formattedLines = useMemo(() => {
    const formatted = JSON.stringify(json, null, 2)
    if (!formatted) return []
    return formatted.split('\n')
  }, [json])

  const highlightLine = (line: string) => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    TOKEN_REGEX.lastIndex = 0
    while ((match = TOKEN_REGEX.exec(line)) !== null) {
      const matchStart = match.index
      const matchEnd = TOKEN_REGEX.lastIndex
      const matchedText = match[0]

      if (matchStart > lastIndex) {
        parts.push(line.slice(lastIndex, matchStart))
      }

      if (matchedText.endsWith(':')) {
        const keyName = matchedText.slice(0, -1)
        parts.push(
          <span key={matchStart} className="text-sky-400 font-semibold">
            {keyName}
          </span>
        )
        parts.push(':')
      } else if (matchedText.startsWith('"')) {
        parts.push(
          <span key={matchStart} className="text-emerald-300">
            {matchedText}
          </span>
        )
      } else if (matchedText === 'true' || matchedText === 'false') {
        parts.push(
          <span key={matchStart} className="text-purple-400 font-bold">
            {matchedText}
          </span>
        )
      } else if (matchedText === 'null') {
        parts.push(
          <span key={matchStart} className="text-rose-400 italic">
            {matchedText}
          </span>
        )
      } else {
        parts.push(
          <span key={matchStart} className="text-amber-300 font-mono">
            {matchedText}
          </span>
        )
      }

      lastIndex = matchEnd
    }

    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex))
    }

    return parts
  }

  if (formattedLines.length === 0) {
    return <span className="text-neutral-500">无数据</span>
  }

  return (
    <div className="font-mono text-[11px] leading-relaxed select-text space-y-0.5">
      {formattedLines.map((line, idx) => (
        <div key={idx} className="flex hover:bg-neutral-900/60 rounded px-1">
          <span className="w-8 select-none text-neutral-600 text-right pr-3 shrink-0 font-mono text-[10px]">
            {idx + 1}
          </span>
          <span className="text-neutral-300 whitespace-pre">{highlightLine(line)}</span>
        </div>
      ))}
    </div>
  )
}

export const DetailRawJsonTab: React.FC = () => {
  const { witrResult } = useAppStore()
  const { copyWithFeedback, isCopied } = useCopyFeedback()

  return (
    <div className="relative rounded-xl bg-neutral-900/90 border border-neutral-800 overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950/80 border-b border-neutral-800/80 text-xs">
        <span className="font-mono text-neutral-400 text-[11px] flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-sky-400" />
          witr Process &amp; Ancestry JSON Payload
        </span>
        <button
          onClick={() => copyWithFeedback('rawJson', JSON.stringify(witrResult, null, 2))}
          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
        >
          {isCopied('rawJson') ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">已复制</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>复制 JSON</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 max-h-56 overflow-auto">
        <HighlightedJson json={witrResult} />
      </div>
    </div>
  )
}
