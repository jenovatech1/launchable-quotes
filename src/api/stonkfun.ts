import type { PairsResponse, QuotePair } from '../types/pairs'

export const STONKFUN_ORIGIN = 'https://www.stonkfun.xyz'
export const LAUNCHABLE_PAIRS_URL = `${STONKFUN_ORIGIN}/api/public/v1/pairs?launchable=true`

function isPair(value: unknown): value is QuotePair {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.mint === 'string' &&
    typeof p.symbol === 'string' &&
    typeof p.name === 'string' &&
    typeof p.category === 'string' &&
    p.launchable === true
  )
}

function extractPairs(payload: unknown): QuotePair[] {
  if (!payload || typeof payload !== 'object') return []

  const root = payload as Record<string, unknown>

  // Canonical: { data: { pairs: [...] } }
  const data = root.data
  if (data && typeof data === 'object') {
    const nested = (data as Record<string, unknown>).pairs
    if (Array.isArray(nested)) return nested.filter(isPair)
  }

  // Fallbacks if the public shape drifts
  if (Array.isArray(root.pairs)) return root.pairs.filter(isPair)
  if (Array.isArray(root.data)) return root.data.filter(isPair)
  if (Array.isArray(payload)) return payload.filter(isPair)

  return []
}

function extractGeneratedAt(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const meta = (payload as PairsResponse).meta
  return typeof meta?.generatedAt === 'string' ? meta.generatedAt : null
}

export function logoSrc(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) return logoUrl
  if (logoUrl.startsWith('/')) return `${STONKFUN_ORIGIN}${logoUrl}`
  return null
}

export async function fetchLaunchablePairs(
  signal?: AbortSignal,
): Promise<{ pairs: QuotePair[]; generatedAt: string | null }> {
  const res = await fetch(LAUNCHABLE_PAIRS_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!res.ok) {
    throw new Error(`StonkFun API returned ${res.status} ${res.statusText}`)
  }

  const json: unknown = await res.json()
  const pairs = extractPairs(json)

  if (pairs.length === 0) {
    // Distinguish empty-but-valid vs unparseable
    const looksLikeEnvelope =
      !!json &&
      typeof json === 'object' &&
      ('data' in (json as object) || 'pairs' in (json as object) || 'meta' in (json as object))

    if (!looksLikeEnvelope) {
      throw new Error('Unexpected API response shape — no launchable pairs found.')
    }
  }

  return { pairs, generatedAt: extractGeneratedAt(json) }
}
