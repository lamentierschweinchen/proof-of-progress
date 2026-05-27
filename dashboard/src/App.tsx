import { useStats } from './hooks/useStats'
import { useDigest } from './hooks/useDigest'
import { Header } from './components/Header'
import { SectionNav } from './components/SectionNav'
import { StatsPanel } from './components/StatsPanel'
import { DigestViewer } from './components/DigestViewer'
import { ContributorsTable } from './components/ContributorsTable'

function App() {
  const { stats } = useStats()
  const { manifest, selectedDate, setSelectedDate, html, loading: digestLoading } = useDigest()

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <Header
        stats={stats}
        manifest={manifest}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      <SectionNav />

      <main className="max-w-[1380px] mx-auto px-6 pb-16 space-y-8 pt-6">
        {stats && (
          <SectionBlock id="stats" title="28-Day Activity" subtitle={`${stats.window.start} → ${stats.window.end}`}>
            <StatsPanel stats={stats} />
          </SectionBlock>
        )}

        <SectionBlock
          id="digest"
          title="Digest"
          subtitle={selectedDate ? selectedDate : undefined}
        >
          <DigestViewer
            html={html}
            loading={digestLoading}
            manifest={manifest}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </SectionBlock>

        {stats && stats.top_contributors.some(c => c.commits_28d > 0 && !c.login.includes('[bot]')) && (
          <SectionBlock id="contributors" title="Contributors" subtitle="Last 28 days">
            <ContributorsTable contributors={stats.top_contributors} />
          </SectionBlock>
        )}
      </main>

      <footer className="border-t border-border py-4 px-6 text-[10px] text-text-faint font-mono uppercase tracking-widest text-center">
        MultiversX Proof of Progress · Updated daily ·{' '}
        <a
          href="https://github.com/lamentierschweinchen/proof-of-progress"
          className="text-text-muted hover:text-accent-cyan transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          lamentierschweinchen/proof-of-progress
        </a>
      </footer>
    </div>
  )
}

function SectionBlock({
  id,
  title,
  subtitle,
  children,
}: {
  id: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-3 border-b border-border pb-2">
        <h2 className="text-[14px] font-semibold text-text-primary tracking-tight">{title}</h2>
        {subtitle && (
          <span className="text-[10.5px] text-text-muted uppercase tracking-widest font-mono">{subtitle}</span>
        )}
      </div>
      <section id={id}>{children}</section>
    </div>
  )
}

export default App
