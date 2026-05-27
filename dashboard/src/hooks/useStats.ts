import { useState, useEffect } from 'react'
import type { Stats } from '../types'

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/proof-of-progress/data/stats.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<Stats>
      })
      .then(data => { setStats(data); setLoading(false) })
      .catch(err => { setError(err instanceof Error ? err.message : 'Failed to load stats'); setLoading(false) })
  }, [])

  return { stats, loading, error }
}
