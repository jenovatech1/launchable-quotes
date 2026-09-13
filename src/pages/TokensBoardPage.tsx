import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { fetchAllPairs, fetchGraduatedTokens, fetchNewTokens } from '../api/stonkfun'
import type { TokenListStatus } from '../api/stonkfun'
import { GraduatedTokenCard } from '../components/GraduatedTokenCard'
import type { QuotePair } from '../types/pairs'
import type { GraduatedFetchState } from '../types/tokens'

const PAGE_SIZE = 24

type QuoteFilter =
  | { kind: 'all' }
  | { kind: 'category'; category: string }
  | { kind: 'quote'; mint: string; symbol: string }

export type TokensBoardConfig = {
  tokenStatus: TokenListStatus
  cardVariant: 'graduated' | 'new'
  pill: string
  title: string
  lede: string
  toolbarLabel: string
  loadingLabel: string
  errorFallbackLabel: string
  emptyLabel: string
  rawApiUrl: string
  paginationLabel: string
}

function matchesPairQuery(pair: QuotePair, q: string): boolean {
  if (!q) return true
  const hay = `${pair.symbol} ${pair.name} ${pair.mint} ${pair.category} ${pair.categoryLabel}`.toLowerCase()
  return hay.includes(q)
}

type Props = {
  config: TokensBoardConfig
}

export function TokensBoardPage({ config }: Props) {
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
    const fetchTokens = config.tokenStatus === 'new' ? fetchNewTokens : fetchGraduatedTokens

    async function load() {
      setState({ status: 'loading' })
      try {
        const result = await fetchTokens(
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
        const message = err instanceof Error ? err.message : config.errorFallbackLabel
        setState({ status: 'error', message })
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [page, deferredTokenQuery, filter, config.tokenStatus, config.errorFallbackLabel])

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
    <div className="page board-page">
      <section className="board-hero">
        <div className="board-hero-copy">
          <p className="live-pill">
            <span className="live-dot" aria-hidden="true" />
            {config.pill}
          </p>
          <h1>{config.title}</h1>
          <p className="lede">{config.lede}</p>
        </div>
      </section>

      <section className="toolbar graduated-toolbar" aria-label={config.toolbarLabel}>
        <label className="search">
          <span className="sr-only">Search tokens</span>
          <input
            type="search"
            placeholder="Search name, symbol, or mint…"
            value={tokenQuery}
            onChange={(e) => {
              setTokenQuery(e.target.value)
              setPage(1)
            }}
            autoComplete="off"
            spellCheck={false}
          />
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

        <div className="category-pills" role="tablist" aria-label="Quote categories">
          <button
            type="button"
            role="tab"
            aria-selected={filter.kind === 'all'}
            className={filter.kind === 'all' ? 'pill active' : 'pill'}
            onClick={selectAll}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={filter.kind === 'category' && filter.category === c.key}
              className={
                filter.kind === 'category' && filter.category === c.key ? 'pill active' : 'pill'
              }
              onClick={() => selectCategory(c.key)}
              disabled={filter.kind === 'quote'}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="toolbar-status" aria-live="polite">
          {state.status === 'ok' ? (
            <>
              Showing <strong>{tokens.length}</strong> of {pagination?.total.toLocaleString()} ·{' '}
              {filterSummary} · newest first
              {state.fetchedAt ? (
                <span className="refreshed"> · loaded {state.fetchedAt.toLocaleTimeString()}</span>
              ) : null}
            </>
          ) : state.status === 'loading' ? (
            config.loadingLabel
          ) : (
            config.errorFallbackLabel
          )}
        </div>
      </section>

      {state.status === 'error' ? (
        <div className="error-panel" role="alert">
          <h2>API request failed</h2>
          <p>{state.message}</p>
          <p className="error-hint">
            Try again shortly, or open the{' '}
            <a href={config.rawApiUrl} target="_blank" rel="noreferrer">
              raw endpoint
            </a>{' '}
            to confirm availability. This tool never invents fake tokens.
          </p>
        </div>
      ) : null}

      {state.status === 'loading' ? (
        <div className="token-grid skeleton-grid" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : null}

      {state.status === 'ok' && tokens.length === 0 ? (
        <p className="empty">{config.emptyLabel}</p>
      ) : null}

      {state.status === 'ok' && tokens.length > 0 ? (
        <div className="token-grid" role="list">
          {tokens.map((token, index) => (
            <div key={token.mint} role="listitem">
              <GraduatedTokenCard token={token} index={index} variant={config.cardVariant} />
            </div>
          ))}
        </div>
      ) : null}

      {pagination && pagination.totalPages > 1 ? (
        <nav className="pagination" aria-label={config.paginationLabel}>
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
