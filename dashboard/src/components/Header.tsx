import { formatDate, formatTimestamp } from '../lib/formatters'
import type { Stats, DigestManifestEntry } from '../types'

interface HeaderProps {
  stats: Stats | null
  manifest: DigestManifestEntry[]
  selectedDate: string
  onDateChange: (date: string) => void
}

export function Header({ stats, manifest, selectedDate, onDateChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-sm">
      <div className="flex items-center px-6 py-3 gap-6 border-b border-border-subtle">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-6 bg-accent-cyan rounded-sm shadow-[0_0_8px_rgba(35,247,221,0.5)]" />
          <div className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold tracking-tight text-text-primary">
              Proof of Progress
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted">
              MultiversX Engineering Digest
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* 28d summary chips */}
        {stats && (
          <div className="hidden md:flex items-center gap-5">
            <Chip label="Commits" value={String(stats.totals.commits)} />
            <div className="h-5 w-px bg-border" />
            <Chip label="PRs merged" value={String(stats.totals.prs_merged)} />
            <div className="h-5 w-px bg-border" />
            <Chip label="Active repos" value={`${stats.totals.repos_active}/14`} />
          </div>
        )}
      </div>

      {/* Bottom row */}
      <div className="flex items-center px-6 py-2 gap-4 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="text-text-muted uppercase tracking-wider text-[10px]">Digest</span>
          <select
            value={selectedDate}
            onChange={e => onDateChange(e.target.value)}
            className="bg-surface border border-border text-text-primary text-[11px] font-mono rounded px-2 py-0.5 focus:outline-none focus:border-accent-cyan/60 cursor-pointer hover:border-border-strong transition-colors"
          >
            {manifest.map(entry => (
              <option key={entry.date} value={entry.date}>{formatDate(entry.date)}</option>
            ))}
          </select>
        </div>

        {stats && (
          <>
            <div className="h-3 w-px bg-border" />
            <span className="text-text-muted">
              Window{' '}
              <span className="text-text-secondary font-mono">{stats.window.start}</span>
              {' → '}
              <span className="text-text-secondary font-mono">{stats.window.end}</span>
              <span className="text-text-faint"> ({stats.window.days}d)</span>
            </span>
          </>
        )}

        <div className="flex-1" />

        {stats && (
          <span className="text-text-muted">
            Stats{' '}
            <span className="text-text-secondary font-mono">{formatTimestamp(stats.generated_at)}</span>
          </span>
        )}

        <a
          href="https://github.com/lamentierschweinchen/proof-of-progress"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-muted hover:text-accent-cyan transition-colors uppercase tracking-wider text-[10px]"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  )
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] font-medium text-text-muted tracking-wider uppercase">{label}</span>
      <span className="hero-number-sm">{value}</span>
    </div>
  )
}
