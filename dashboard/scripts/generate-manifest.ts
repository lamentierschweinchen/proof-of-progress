import fs from 'fs'
import path from 'path'

const digestsDir = path.resolve(import.meta.dirname, '../../digests')
const dataDir = path.resolve(import.meta.dirname, '../../data')
const publicDir = path.resolve(import.meta.dirname, '../public')
const publicDigestsDir = path.resolve(publicDir, 'digests')
const publicDataDir = path.resolve(publicDir, 'data')

fs.mkdirSync(publicDigestsDir, { recursive: true })
fs.mkdirSync(publicDataDir, { recursive: true })

const sourceExists = fs.existsSync(digestsDir)

const files = sourceExists
  ? fs.readdirSync(digestsDir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse()
  : fs.readdirSync(publicDigestsDir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort().reverse()

const manifest = files.map(f => ({ date: f.replace('.md', ''), file: f }))

fs.writeFileSync(
  path.resolve(publicDir, 'digest-manifest.json'),
  JSON.stringify(manifest, null, 2),
)

if (sourceExists) {
  for (const file of files) {
    fs.copyFileSync(path.resolve(digestsDir, file), path.resolve(publicDigestsDir, file))
  }
  const statsFile = path.resolve(dataDir, 'stats.json')
  if (fs.existsSync(statsFile)) {
    fs.copyFileSync(statsFile, path.resolve(publicDataDir, 'stats.json'))
  }
}

console.log(`Manifest: ${files.length} digest(s) — ${files[0] ?? 'none'} … ${files[files.length - 1] ?? ''}`)
