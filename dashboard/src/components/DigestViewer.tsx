import type { DigestManifestEntry } from '../types'
import { formatDate } from '../lib/formatters'

interface DigestViewerProps {
  html: string | null
  loading: boolean
  manifest: DigestManifestEntry[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function DigestViewer({ html, loading, manifest, selectedDate, onDateChange }: DigestViewerProps) {
  return (
    <div className="card">
      {/* Digest nav bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-bg-elevated overflow-x-auto">
        {manifest.map(entry => (
          <button
            key={entry.date}
            onClick={() => onDateChange(entry.date)}
            className={[
              'flex-shrink-0 px-3 py-1 rounded text-[11px] font-mono transition-colors',
              entry.date === selectedDate
                ? 'bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30'
                : 'text-text-muted hover:text-text-secondary border border-transparent',
            ].join(' ')}
          >
            {formatDate(entry.date)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading && (
          <div className="flex items-center gap-3 py-8">
            <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            <span className="text-text-muted text-sm font-mono uppercase tracking-wider">Loading digest…</span>
          </div>
        )}
        {!loading && html && (
          <div
            className="digest-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        {!loading && !html && (
          <p className="text-text-muted text-sm font-mono">No digest available for this date.</p>
        )}
      </div>
    </div>
  )
}
