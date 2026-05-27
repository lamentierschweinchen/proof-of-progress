import type { Contributor } from '../types'

interface ContributorsTableProps {
  contributors: Contributor[]
}

export function ContributorsTable({ contributors }: ContributorsTableProps) {
  const active = contributors.filter(c => c.commits_28d > 0 && !c.login.includes('[bot]'))
  const maxCommits = active[0]?.commits_28d ?? 1

  return (
    <div className="card overflow-hidden">
      <table className="terminal-table">
        <thead>
          <tr>
            <th>Contributor</th>
            <th>Commits (28d)</th>
            <th>PRs merged</th>
            <th>Share</th>
            <th>Repos</th>
          </tr>
        </thead>
        <tbody>
          {active.map((c, i) => {
            const pct = Math.round((c.commits_28d / maxCommits) * 100)
            return (
              <tr key={c.login}>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-faint w-4">{i + 1}</span>
                    <img src={c.avatar_url} alt="" className="w-5 h-5 rounded-full opacity-80" />
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[12px] text-text-primary hover:text-accent-cyan transition-colors"
                    >
                      @{c.login}
                    </a>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px]">{c.commits_28d}</span>
                    <div className="flex-1 h-1 bg-surface-strong rounded-full overflow-hidden max-w-24">
                      <div className="h-full bg-accent-cyan/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </td>
                <td className="font-mono text-[12px] text-text-secondary">{c.prs_merged_28d}</td>
                <td className="font-mono text-[12px] text-text-muted">
                  {maxCommits > 0 ? `${Math.round((c.commits_28d / (contributors.filter(x => !x.login.includes('[bot]')).reduce((s, x) => s + x.commits_28d, 0))) * 100)}%` : '—'}
                </td>
                <td className="font-mono text-[12px] text-text-muted">{c.repos_touched}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
