export const SECTION_IDS = ['stats', 'digest', 'contributors'] as const

export const SECTION_LABELS: Record<string, string> = {
  stats: 'Activity',
  digest: 'Digest',
  contributors: 'Contributors',
}

export const REPO_COLORS: Record<string, string> = {
  'mx-sdk-rs': '#23F7DD',
  'mx-chain-go': '#5896F2',
  'mx-api-service': '#B975F0',
  'mx-chain-simulator-go': '#34D196',
  'mx-sdk-js-core': '#FB8534',
  'mx-sdk-dapp': '#E8B43A',
  'mx-chain-vm-go': '#F4525A',
  'mx-chain-es-indexer-go': '#8B97AC',
}

export function repoColor(name: string): string {
  return REPO_COLORS[name] ?? '#5C6679'
}
