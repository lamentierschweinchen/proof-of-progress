interface MetricCardProps {
  label: string
  value: string
  unit?: string
  sub?: string
  accent?: boolean
  className?: string
}

export function MetricCard({ label, value, unit, sub, accent = false, className = '' }: MetricCardProps) {
  return (
    <div className={`relative bg-surface border border-border rounded-md px-4 py-3 flex flex-col gap-1.5 card-hover ${className}`}>
      {accent && (
        <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-accent-cyan/60 rounded" />
      )}
      <span className="eyebrow">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="hero-number">{value}</span>
        {unit && <span className="hero-unit">{unit}</span>}
      </div>
      {sub && <span className="text-[11px] text-text-muted font-mono">{sub}</span>}
    </div>
  )
}
