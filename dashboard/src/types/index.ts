export interface DigestManifestEntry {
  date: string
  file: string
}

export interface StatsWindow {
  start: string
  end: string
  days: number
}

export interface StatsTotals {
  commits: number
  prs_merged: number
  prs_opened: number
  contributors: number
  releases: number
  repos_active: number
}

export interface RepoStats {
  name: string
  full_name: string
  url: string
  description: string | null
  stars: number
  open_issues: number
  open_prs: number
  default_branch: string
  commits_28d: number
  commits_7d: number
  prs_merged_28d: number
  contributors_28d: number
  last_commit_at: string | null
  last_commit_message: string | null
  weekly_commits: number[]
}

export interface Contributor {
  login: string
  avatar_url: string
  html_url: string
  commits_28d: number
  prs_merged_28d: number
  repos_touched: number
  highlighted: boolean
}

export interface Release {
  repo: string
  tag: string
  name: string
  published_at: string
  url: string
  is_prerelease: boolean
}

export interface Stats {
  generated_at: string
  window: StatsWindow
  totals: StatsTotals
  repos: RepoStats[]
  top_contributors: Contributor[]
  recent_releases: Release[]
  daily_commits: number[]
}
