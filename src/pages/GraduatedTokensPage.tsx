import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { fetchAllPairs, fetchGraduatedTokens } from '../api/stonkfun'
import { GraduatedTokenRow } from '../components/GraduatedTokenRow'
import type { QuotePair } from '../types/pairs'
import type { GraduatedFetchState } from '../types/tokens'

const PAGE_SIZE = 25

type QuoteFilter =
  | { kind: 'all' }
  | { kind: 'category'; category: string }
  | { kind: 'quote'; mint: string; symbol: string }

function matchesPairQuery(pair: QuotePair, q: string): boolean {
  if (!q) return true
  const hay = `${pair.symbol} ${pair.name} ${pair.mint} ${pair.category} ${pair.categoryLabel}`.toLowerCase()
  return hay.includes(q)
}

export function GraduatedTokensPage() {
  const [state, setState] = useState<GraduatedFetchState>({ status: 'loading' })
  const [pairs, setPairs] = useState<QuotePair[]>([])
  const [pairsError, setPairsError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [tokenQuery, setTokenQuery] = useState('')
  const [quoteSearch, setQuoteSearch] = useState('')
  const [filter, setFilter] = useState<QuoteFilter>({ kind: 'all' })
  const deferredTokenQuery = useDeferredValue(tokenQuery.trim())
  const deferredQuoteSearch = useDeferredValue(quoteSearch.trim().toLowerCase())

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function loadPairs() {
      try {
        const result = await fetchAllPairs(controller.signal)
        if (cancelled) return
        setPairs(result.pairs)
        setPairsError(null)
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return
        setPairsError(err instanceof Error ? err.message : 'Failed to load quote pairs')
      }
    }

    void loadPairs()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function load() {
      setState({ status: 'loading' })
      try {
        const result = await fetchGraduatedTokens(
          {
            page,
            pageSize: PAGE_SIZE,
            q: deferredTokenQuery || undefined,
            quoteMint: filter.kind === 'quote' ? filter.mint : undefined,
            category: filter.kind === 'category' ? filter.category : undefined,
          },
          controller.signal,
        )
        if (cancelled) return
        setState({
          status: 'ok',
          tokens: result.tokens,
          pagination: result.pagination,
          generatedAt: result.generatedAt,
          fetchedAt: new Date(),
        })
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return
        const message = err instanceof Error ? err.message : 'Failed to fetch graduated tokens'
        setState({ status: 'error', message })
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [page, deferredTokenQuery, filter])

  const categories = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const p of pairs) {
      const key = p.category
      const prev = counts.get(key)
      if (prev) prev.count += 1
      else counts.set(key, { label: p.categoryLabel || p.category, count: 1 })
    }
    return [...counts.entries()]
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [pairs])

  const quoteSuggestions = useMemo(() => {
    if (!deferredQuoteSearch) return []
    return pairs
      .filter((p) => matchesPairQuery(p, deferredQuoteSearch))
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
      .slice(0, 12)
  }, [pairs, deferredQuoteSearch])

  const pagination = state.status === 'ok' ? state.pagination : null
  const tokens = state.status === 'ok' ? state.tokens : []

  function selectAll() {
    setFilter({ kind: 'all' })
    setPage(1)
    setQuoteSearch('')
  }

  function selectCategory(category: string) {
    if (category === 'all') {
      selectAll()
      return
    }
    setFilter({ kind: 'category', category })
    setPage(1)
    setQuoteSearch('')
  }

  function selectQuote(pair: QuotePair) {
    setFilter({ kind: 'quote', mint: pair.mint, symbol: pair.symbol })
    setQuoteSearch(pair.symbol)
    setPage(1)
  }

  const filterSummary =
    filter.kind === 'quote'
      ? `quote ${filter.symbol}`
      : filter.kind === 'category'
        ? `category ${filter.category}`
        : 'all quotes'

  return (
    <div className="page">
      <section className="hero">
        <p className="live-pill">
          <span className="live-dot" aria-hidden="true" />
          Just graduated
        </p>
        <h1>Graduated Tokens</h1>
        <p className="lede">
          Newest StonkFun graduations first — filter by quote mint, symbol, or pair category. Native UI
          has no Graduated tab; this page uses the public API.
        </p>
      </section>

      <section className="toolbar graduated-toolbar" aria-label="Filter graduated tokens">
        <label className="search">
          <span className="sr-only">Search tokens</span>
          <input
            type="search"
            placeholder="Search token name, symbol, or mint…"
            value={tokenQuery}
            onChange={(e) => {
              setTokenQuery(e.target.value)
              setPage(1)
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <label className="category-filter">
          <span className="sr-only">Quote category</span>
          <select
            value={filter.kind === 'category' ? filter.category : filter.kind === 'all' ? 'all' : ''}
            onChange={(e) => selectCategory(e.target.value)}
            disabled={filter.kind === 'quote'}
          >
            <option value="all">All quote categories</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({c.count} quotes)
              </option>
            ))}
            {filter.kind === 'quote' ? (
              <option value="">Quote locked: {filter.symbol}</option>
            ) : null}
          </select>
        </label>

        <div className="quote-picker">
          <label className="search">
            <span className="sr-only">Filter by quote / pair</span>
            <input
              type="search"
              placeholder="Filter by quote (SPYX, NVDAX, SOL…)…"
              value={quoteSearch}
              onChange={(e) => {
                setQuoteSearch(e.target.value)
                if (filter.kind === 'quote') setFilter({ kind: 'all' })
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          {quoteSuggestions.length > 0 && filter.kind !== 'quote' ? (
            <ul className="quote-suggestions" role="listbox" aria-label="Matching quotes">
              {quoteSuggestions.map((pair) => (
                <li key={pair.mint}>
                  <button type="button" onClick={() => selectQuote(pair)}>
                    <span className="suggest-symbol">{pair.symbol}</span>
                    <span className="suggest-meta">
                      {pair.categoryLabel || pair.category}
                      {pair.launchable === false ? ' · retired' : ''}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {filter.kind === 'quote' ? (
            <button type="button" className="clear-filter" onClick={selectAll}>
              Clear quote filter ({filter.symbol})
            </button>
          ) : null}
          {pairsError ? <p className="filter-hint">Quote list unavailable: {pairsError}</p> : null}
        </div>

        <div className="toolbar-status" aria-live="polite">
          {state.status === 'ok' ? (
            <>
              Showing <strong>{tokens.length}</strong> of {pagination?.total.toLocaleString()} ·{' '}
              {filterSummary} · sorted by graduatedAt
              {state.fetchedAt ? (
                <span className="refreshed"> · loaded {state.fetchedAt.toLocaleTimeString()}</span>
              ) : null}
            </>
          ) : state.status === 'loading' ? (
            'Loading graduated tokens…'
          ) : (
            'Could not load graduated tokens'
          )}
        </div>
      </section>

      {state.status === 'error' ? (
        <div className="error-panel" role="alert">
          <h2>API request failed</h2>
          <p>{state.message}</p>
          <p className="error-hint">
            Try again shortly, or open the{' '}
            <a
              href="https://www.stonkfun.xyz/api/public/v1/tokens?status=graduated&sort=newest&pageSize=25"
              target="_blank"
              rel="noreferrer"
            >
              raw endpoint
            </a>{' '}
            to confirm availability. This tool never invents fake tokens.
          </p>
        </div>
      ) : null}

      {state.status === 'loading' ? (
        <div className="skeleton-list" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton-row" />
          ))}
        </div>
      ) : null}

      {state.status === 'ok' && tokens.length === 0 ? (
        <p className="empty">No graduated tokens match that filter.</p>
      ) : null}

      {state.status === 'ok' && tokens.length > 0 ? (
        <div className="quote-list" role="list">
          {tokens.map((token, index) => (
            <div key={token.mint} role="listitem">
              <GraduatedTokenRow token={token} index={index} />
            </div>
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <nav className="pagination" aria-label="Graduated tokens pages">
          <button
            type="button"
            className="page-btn"
            disabled={page <= 1 || state.status === 'loading'}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="page-status">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="page-btn"
            disabled={page >= pagination.totalPages || state.status === 'loading'}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
          >
            Next
          </button>
        </nav>
      ) : null}
    </div>
  )
}
