// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Theme = any

export const darkTheme: Theme = {
  background: 'transparent',
  text: {
    fontSize: 11,
    fill: '#8B97AC',
    fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
  },
  axis: {
    domain: { line: { stroke: '#232A3D', strokeWidth: 1 } },
    ticks: {
      line: { stroke: '#232A3D', strokeWidth: 1 },
      text: { fill: '#5C6679', fontSize: 10, fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace' },
    },
    legend: {
      text: { fill: '#8B97AC', fontSize: 11, fontWeight: 500, fontFamily: '"Inter", system-ui, sans-serif' },
    },
  },
  grid: { line: { stroke: '#1A2030', strokeWidth: 1 } },
  legends: { text: { fill: '#8B97AC', fontSize: 10, fontFamily: '"Inter", system-ui, sans-serif' } },
  tooltip: {
    container: {
      background: '#0A0D14',
      color: '#E8EDF5',
      fontSize: 11,
      fontFamily: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
      borderRadius: 4,
      border: '1px solid #2D364D',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      padding: '6px 10px',
    },
  },
}
