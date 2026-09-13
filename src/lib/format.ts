export function shortMint(mint: string): string {
  if (mint.length <= 12) return mint
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`
}

export function formatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  if (abs >= 1) return `${sign}$${abs.toFixed(2)}`
  return `${sign}$${abs.toPrecision(2)}`
}

export function formatRelativeTime(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '—'
  const then = Date.parse(iso)
  if (!Number.isFinite(then)) return '—'
  const deltaSec = Math.round((then - now) / 1000)
  const abs = Math.abs(deltaSec)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (abs < 60) return rtf.format(deltaSec, 'second')
  const deltaMin = Math.round(deltaSec / 60)
  if (Math.abs(deltaMin) < 60) return rtf.format(deltaMin, 'minute')
  const deltaHr = Math.round(deltaMin / 60)
  if (Math.abs(deltaHr) < 48) return rtf.format(deltaHr, 'hour')
  const deltaDay = Math.round(deltaHr / 24)
  if (Math.abs(deltaDay) < 60) return rtf.format(deltaDay, 'day')
  return new Date(then).toLocaleDateString()
}
