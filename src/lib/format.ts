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

export function formatPriceUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1) return formatUsd(value)
  if (abs >= 0.01) return `$${abs.toFixed(4)}`
  if (abs >= 0.0001) return `$${abs.toFixed(6)}`
  return `$${abs.toPrecision(3)}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function graduationProgressParts(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null
  const clamped = Math.min(1, Math.max(0, value))
  const donePct = clamped * 100
  const remainingPct = (1 - clamped) * 100
  return { clamped, donePct, remainingPct }
}

export function formatGraduationPercent(value: number | null | undefined): string {
  const parts = graduationProgressParts(value)
  if (!parts) return '—'
  const { donePct } = parts
  if (donePct > 0 && donePct < 0.01) return '<0.01%'
  if (donePct >= 99.995) return '100%'
  return `${donePct.toFixed(donePct >= 10 ? 1 : 2)}%`
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
