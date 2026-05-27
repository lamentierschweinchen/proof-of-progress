import { useState, useEffect } from 'react'
import { marked } from 'marked'
import type { DigestManifestEntry } from '../types'

// Open links in new tab
const renderer = new marked.Renderer()
renderer.link = ({ href, title, text }) => {
  const t = title ? ` title="${title}"` : ''
  return `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${text}</a>`
}
marked.use({ renderer })

export function useDigest() {
  const [manifest, setManifest] = useState<DigestManifestEntry[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/proof-of-progress/digest-manifest.json')
      .then(r => r.json() as Promise<DigestManifestEntry[]>)
      .then(data => {
        setManifest(data)
        if (data.length > 0 && !selectedDate) setSelectedDate(data[0].date)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load manifest'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    setHtml(null)
    fetch(`/proof-of-progress/digests/${selectedDate}.md`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then(async text => {
        const result = await marked.parse(text)
        setHtml(result)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load digest')
        setLoading(false)
      })
  }, [selectedDate])

  return { manifest, selectedDate, setSelectedDate, html, loading, error }
}
