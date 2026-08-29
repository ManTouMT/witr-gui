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
          <span key={matchStart} className="text-amber-400 font-bold">
            {matchedText}
          </span>
        )
      } else if (matchedText === 'null') {
        parts.push(
          <span key={matchStart} className="text-neutral-500 italic font-bold">
            {matchedText}
          </span>
        )
      } else {
        parts.push(
          <span key={matchStart} className="text-purple-300 font-bold">
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

  return (
    <pre className="font-mono text-[11px] leading-relaxed text-neutral-300 select-text">
      {formattedLines.map((line, idx) => (
        <div key={idx} className="hover:bg-white/[0.04] px-1 rounded transition-colors duration-75">
          <span className="inline-block w-8 text-neutral-600 select-none text-right pr-3 font-mono text-[10px]">
            {idx + 1}
          </span>
          {highlightLine(line)}
        </div>
      ))}
    </pre>
  )
}

export const DetailRawJsonTab: React.FC = () => {
  const { witrResult } = useAppStore()
  const { copyWithFeedback, isCopied } = useCopyFeedback()

  return (
    <div className="relative rounded-2xl bg-black/60 border border-white/[0.06] overflow-hidden shadow-inner backdrop-blur-md select-none">
      <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-950/80 border-b border-white/[0.06] text-xs">
        <span className="font-mono text-neutral-400 text-[11px] flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-sky-400" />
          witr Process &amp; Ancestry JSON Payload
        </span>
        <button
          onClick={() => copyWithFeedback('rawJson', JSON.stringify(witrResult, null, 2))}
          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer active:scale-95 border border-white/[0.04]"
        >
          {isCopied('rawJson') ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">已复制</span>
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
