import { ResponsiveBar } from '@nivo/bar'
import { MetricCard } from './ui/MetricCard'
import { darkTheme } from '../lib/nivo-theme'
import { repoColor } from '../lib/constants'
import { formatDate } from '../lib/formatters'
import type { Stats } from '../types'

interface StatsPanelProps {
  stats: Stats
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const { totals, repos, top_contributors, daily_commits, window: win } = stats

  const topContributor = top_contributors[0]
  const topPct = totals.commits > 0
    ? Math.round((topContributor.commits_28d / totals.commits) * 100)
    : 0

  // Repo activity data — only active repos, sorted by commits desc
  const activeRepos = repos
    .filter(r => r.commits_28d > 0)
    .sort((a, b) => b.commits_28d - a.commits_28d)
    .map(r => ({
      repo: r.name.replace('mx-', ''),
      commits: r.commits_28d,
      color: repoColor(r.name),
    }))

  // Daily commits sparkline data for Nivo bar
  const dailyData = daily_commits.map((v, i) => {
    const d = new Date(win.start + 'T12:00:00Z')
    d.setUTCDate(d.getUTCDate() + i)
    return { day: d.toISOString().slice(5, 10), commits: v }
  })

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Commits" value={String(totals.commits)} unit="28d" accent />
        <MetricCard label="PRs merged" value={String(totals.prs_merged)} unit="28d" />
        <MetricCard label="Repos active" value={`${totals.repos_active}`} unit={`/ 14`} />
        <MetricCard
          label="Top contributor"
          value={`@${topContributor?.login ?? '—'}`}
          unit=""
          sub={topContributor ? `${topContributor.commits_28d} commits · ${topPct}%` : undefined}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Repo activity */}
        <div className="card p-4">
          <div className="eyebrow mb-3">Commits by repo (28d)</div>
          <div className="space-y-2">
            {activeRepos.map(r => (
              <RepoBar key={r.repo} name={r.repo} commits={r.commits} max={activeRepos[0].commits} color={r.color} />
            ))}
            {activeRepos.length === 0 && (
              <p className="text-text-muted text-xs font-mono">No activity this window</p>
            )}
          </div>
        </div>

        {/* Daily commits */}
        <div className="card p-4">
          <div className="eyebrow mb-1">Daily commits — {win.start} → {win.end}</div>
          <div style={{ height: 140 }}>
            <ResponsiveBar
              data={dailyData}
              keys={['commits']}
              indexBy="day"
              theme={darkTheme}
              colors={['#23F7DD']}
              colorBy="indexValue"
              enableLabel={false}
              axisBottom={{
                tickSize: 0,
                tickPadding: 4,
                tickValues: dailyData.filter((_, i) => i % 7 === 0).map(d => d.day),
                format: d => {
                  const date = new Date(`2026-${d}T12:00:00Z`)
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
                },
              }}
              axisLeft={{ tickSize: 0, tickPadding: 4, tickValues: 3 }}
              margin={{ top: 8, right: 8, bottom: 28, left: 28 }}
              padding={0.2}
              tooltip={({ data }) => (
                <div style={{ background: '#0A0D14', border: '1px solid #2D364D', borderRadius: 4, padding: '4px 8px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#E8EDF5' }}>
                  {data.day}: <strong>{data.commits}</strong>
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* Recent releases */}
      {stats.recent_releases.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <span className="eyebrow">Recent releases</span>
          </div>
          <table className="terminal-table">
            <thead>
              <tr>
                <th>Repo</th>
                <th>Tag</th>
                <th>Published</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_releases.slice(0, 6).map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-[12px] text-text-muted">{r.repo.replace('mx-', '')}</td>
                  <td>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] text-accent-cyan hover:underline">
                      {r.tag}
                    </a>
                  </td>
                  <td className="font-mono text-[12px] text-text-secondary">{formatDate(r.published_at.slice(0, 10))}</td>
                  <td>
                    {r.is_prerelease
                      ? <span className="text-[10px] font-mono font-semibold text-severity-medium uppercase tracking-wider">pre</span>
                      : <span className="text-[10px] font-mono font-semibold text-up uppercase tracking-wider">stable</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function RepoBar({ name, commits, max, color }: { name: string; commits: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((commits / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] text-text-muted w-32 flex-shrink-0 truncate">{name}</span>
      <div className="flex-1 h-1.5 bg-surface-strong rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-[11px] text-text-secondary w-6 text-right flex-shrink-0">{commits}</span>
    </div>
  )
}
