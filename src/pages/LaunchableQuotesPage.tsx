import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { fetchLaunchablePairs } from '../api/stonkfun'
import type { FetchState, QuotePair } from '../types/pairs'
import { MismatchCallout } from '../components/MismatchCallout'
import { QuoteRow } from '../components/QuoteRow'

const REFRESH_MS = 30_000

function matchesQuery(pair: QuotePair, q: string): boolean {
  if (!q) return true
  const hay = `${pair.symbol} ${pair.name} ${pair.mint} ${pair.category} ${pair.categoryLabel}`.toLowerCase()
  return hay.includes(q)
}

export function LaunchableQuotesPage() {
  const [state, setState] = useState<FetchState>({ status: 'loading' })
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    async function load(isRefresh: boolean) {
      if (!isRefresh) setState({ status: 'loading' })
      try {
        const { pairs, generatedAt } = await fetchLaunchablePairs(controller.signal)
        if (cancelled) return
        setState({
          status: 'ok',
          pairs,
          generatedAt,
          fetchedAt: new Date(),
        })
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return
        const message = err instanceof Error ? err.message : 'Failed to fetch launchable pairs'
        setState({ status: 'error', message })
      }
    }

    void load(false)
    const id = window.setInterval(() => void load(true), REFRESH_MS)

    return () => {
      cancelled = true
      controller.abort()
      window.clearInterval(id)
    }
  }, [])

  const pairs = state.status === 'ok' ? state.pairs : []

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

  const filtered = useMemo(() => {
    return pairs.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      return matchesQuery(p, deferredQuery)
    })
  }, [pairs, category, deferredQuery])

  const xstockCount = useMemo(
    () => pairs.filter((p) => p.category === 'xstock').length,
    [pairs],
  )

  return (
    <div className="page">
      <section className="hero">
        <p className="live-pill">
          <span className="live-dot" aria-hidden="true" />
          Live public API
        </p>
        <h1>Launchable Quotes Live</h1>
        <p className="lede">
          One-page view of StonkFun quote pairs the public API marks as launchable — including when the
          launch UI looks empty.
        </p>
      </section>

      <MismatchCallout
        apiCount={state.status === 'ok' ? state.pairs.length : state.status === 'loading' ? null : 0}
        xstockCount={state.status === 'ok' ? xstockCount : null}
        generatedAt={state.status === 'ok' ? state.generatedAt : null}
      />

      <section className="toolbar" aria-label="Filter launchable quotes">
        <label className="search">
          <span className="sr-only">Search by symbol</span>
          <input
            type="search"
            placeholder="Filter by symbol, name, or mint…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <label className="category-filter">
          <span className="sr-only">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories ({pairs.length})</option>
            {categories.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label} ({c.count})
              </option>
            ))}
          </select>
        </label>
        <div className="toolbar-status" aria-live="polite">
          {state.status === 'ok' ? (
            <>
              Showing <strong>{filtered.length}</strong> of {pairs.length}
              {state.fetchedAt ? (
                <span className="refreshed"> · refreshed {state.fetchedAt.toLocaleTimeString()}</span>
              ) : null}
            </>
          ) : state.status === 'loading' ? (
            'Loading launchable pairs…'
          ) : (
            'Could not load pairs'
          )}
        </div>
      </section>

      {state.status === 'error' ? (
        <div className="error-panel" role="alert">
          <h2>API request failed</h2>
          <p>{state.message}</p>
          <p className="error-hint">
            Try again shortly, or open the{' '}
            <a href="https://www.stonkfun.xyz/api/public/v1/pairs?launchable=true" target="_blank" rel="noreferrer">
              raw endpoint
            </a>{' '}
            to confirm availability. This tool never invents fake pairs.
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

      {state.status === 'ok' && filtered.length === 0 ? (
        <p className="empty">No launchable quotes match that filter.</p>
      ) : null}

      {state.status === 'ok' && filtered.length > 0 ? (
        <div className="quote-list" role="list">
          {filtered.map((pair, index) => (
            <div key={pair.mint} role="listitem">
              <QuoteRow pair={pair} index={index} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
