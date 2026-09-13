import type { PairsResponse, QuotePair } from '../types/pairs'
import type {
  GraduatedToken,
  GraduatedTokensResult,
  TokensPagination,
  TokenQuote,
} from '../types/tokens'

export const STONKFUN_ORIGIN = 'https://www.stonkfun.xyz'
export const API_BASE = `${STONKFUN_ORIGIN}/api/public/v1`
export const LAUNCHABLE_PAIRS_URL = `${API_BASE}/pairs?launchable=true`
export const ALL_PAIRS_URL = `${API_BASE}/pairs`

export type GraduatedTokensQuery = {
  page?: number
  pageSize?: number
  quoteMint?: string
  category?: string
  q?: string
}

function isPair(value: unknown): value is QuotePair {
  if (!value || typeof value !== 'object') return false
  const p = value as Record<string, unknown>
  return (
    typeof p.mint === 'string' &&
    typeof p.symbol === 'string' &&
    typeof p.name === 'string' &&
    typeof p.category === 'string'
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

function isTokenQuote(value: unknown): value is TokenQuote {
  if (!value || typeof value !== 'object') return false
  const q = value as Record<string, unknown>
  return (
    typeof q.mint === 'string' &&
    typeof q.symbol === 'string' &&
    typeof q.name === 'string' &&
    typeof q.category === 'string'
  )
}

function isGraduatedToken(value: unknown): value is GraduatedToken {
  if (!value || typeof value !== 'object') return false
  const t = value as Record<string, unknown>
  return (
    typeof t.mint === 'string' &&
    typeof t.name === 'string' &&
    typeof t.symbol === 'string' &&
    typeof t.status === 'string' &&
    isTokenQuote(t.quote)
  )
}

function extractTokens(payload: unknown): GraduatedToken[] {
  if (!payload || typeof payload !== 'object') return []
  const root = payload as Record<string, unknown>
  const data = root.data
  if (data && typeof data === 'object') {
    const nested = (data as Record<string, unknown>).tokens
    if (Array.isArray(nested)) return nested.filter(isGraduatedToken)
  }
  if (Array.isArray(root.tokens)) return root.tokens.filter(isGraduatedToken)
  return []
}

function extractPagination(payload: unknown, fallbackPage: number, fallbackSize: number): TokensPagination {
  const empty: TokensPagination = {
    page: fallbackPage,
    pageSize: fallbackSize,
    total: 0,
    totalPages: 1,
  }
  if (!payload || typeof payload !== 'object') return empty
  const data = (payload as Record<string, unknown>).data
  if (!data || typeof data !== 'object') return empty
  const pagination = (data as Record<string, unknown>).pagination
  if (!pagination || typeof pagination !== 'object') return empty
  const p = pagination as Record<string, unknown>
  return {
    page: typeof p.page === 'number' ? p.page : fallbackPage,
    pageSize: typeof p.pageSize === 'number' ? p.pageSize : fallbackSize,
    total: typeof p.total === 'number' ? p.total : 0,
    totalPages: typeof p.totalPages === 'number' ? Math.max(1, p.totalPages) : 1,
  }
}

export function logoSrc(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) return logoUrl
  if (logoUrl.startsWith('/')) return `${STONKFUN_ORIGIN}${logoUrl}`
  return null
}

export function tokenPageUrl(mint: string): string {
  return `${STONKFUN_ORIGIN}/token/${mint}`
}

export function dexScreenerUrl(mint: string): string {
  return `https://dexscreener.com/solana/${mint}`
}

export function raydiumSwapUrl(tokenMint: string, quoteMint?: string | null): string {
  const params = new URLSearchParams({
    inputMint: quoteMint || 'sol',
    outputMint: tokenMint,
  })
  return `https://raydium.io/swap/?${params.toString()}`
}

async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!res.ok) {
    throw new Error(`StonkFun API returned ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function fetchLaunchablePairs(
  signal?: AbortSignal,
): Promise<{ pairs: QuotePair[]; generatedAt: string | null }> {
  const json = await fetchJson(LAUNCHABLE_PAIRS_URL, signal)
  const pairs = extractPairs(json).filter((p) => p.launchable === true)

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

export async function fetchAllPairs(
  signal?: AbortSignal,
): Promise<{ pairs: QuotePair[]; generatedAt: string | null }> {
  const json = await fetchJson(ALL_PAIRS_URL, signal)
  const pairs = extractPairs(json)

  if (pairs.length === 0) {
    const looksLikeEnvelope =
      !!json &&
      typeof json === 'object' &&
      ('data' in (json as object) || 'pairs' in (json as object) || 'meta' in (json as object))

    if (!looksLikeEnvelope) {
      throw new Error('Unexpected API response shape — no pairs found.')
    }
  }

  return { pairs, generatedAt: extractGeneratedAt(json) }
}

export async function fetchGraduatedTokens(
  query: GraduatedTokensQuery = {},
  signal?: AbortSignal,
): Promise<GraduatedTokensResult> {
  const page = Math.max(1, query.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 25))

  const params = new URLSearchParams({
    status: 'graduated',
    sort: 'newest',
    page: String(page),
    pageSize: String(pageSize),
  })

  if (query.quoteMint) params.set('quoteMint', query.quoteMint)
  if (query.category) params.set('category', query.category)
  if (query.q) params.set('q', query.q)

  const json = await fetchJson(`${API_BASE}/tokens?${params.toString()}`, signal)
  const tokens = extractTokens(json)
  const pagination = extractPagination(json, page, pageSize)

  if (tokens.length === 0 && pagination.total === 0) {
    const looksLikeEnvelope =
      !!json &&
      typeof json === 'object' &&
      ('data' in (json as object) || 'tokens' in (json as object) || 'meta' in (json as object))

    if (!looksLikeEnvelope) {
      throw new Error('Unexpected API response shape — no graduated tokens found.')
    }
  }

  return {
    tokens,
    pagination,
    generatedAt: extractGeneratedAt(json),
  }
}
