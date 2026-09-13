import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  dexScreenerUrl,
  fetchTokenByMint,
  geckoTerminalPoolUrl,
  logoSrc,
  raydiumSwapUrl,
  resolveChartTarget,
  tokenPageUrl,
  type ChartTarget,
} from '../api/stonkfun'
import { PriceChart } from '../components/PriceChart'
import {
  formatPercent,
  formatPriceUsd,
  formatRelativeTime,
  formatUsd,
  shortMint,
} from '../lib/format'
import type { QuotePair } from '../types/pairs'
import type { GraduatedToken } from '../types/tokens'

type LocationState = {
  token?: GraduatedToken
  pair?: QuotePair
  from?: 'graduated' | 'launchable'
}

type DetailState =
  | { status: 'loading' }
  | { status: 'ok'; token: GraduatedToken }
  | { status: 'missing'; pair: QuotePair | null }
  | { status: 'error'; message: string }

type ChartState =
  | { status: 'loading' }
  | { status: 'ok'; chart: ChartTarget }
  | { status: 'empty' }
  | { status: 'error'; message: string }

export function TokenDetailPage() {
  const { mint = '' } = useParams<{ mint: string }>()
  const location = useLocation()
  const navState = (location.state as LocationState | null) ?? null
  const seedToken =
    navState?.token && navState.token.mint === mint ? navState.token : null
  const seedPair = navState?.pair && navState.pair.mint === mint ? navState.pair : null
  const backTo = navState?.from === 'launchable' ? '/' : '/graduated'
  const backLabel = navState?.from === 'launchable' ? 'Launchable' : 'Graduated'

  const [state, setState] = useState<DetailState>(() =>
    seedToken ? { status: 'ok', token: seedToken } : { status: 'loading' },
  )
  const [copied, setCopied] = useState(false)
  const [chartState, setChartState] = useState<ChartState>({ status: 'loading' })

  useEffect(() => {
    if (!mint) return

    const controller = new AbortController()
    let cancelled = false
    const nav = (location.state as LocationState | null) ?? null
    const seed = nav?.token && nav.token.mint === mint ? nav.token : null
    const pairSeed = nav?.pair && nav.pair.mint === mint ? nav.pair : null

    async function load() {
      if (!seed) setState({ status: 'loading' })
      try {
        const { token } = await fetchTokenByMint(mint, controller.signal)
        if (cancelled) return
        if (token) {
          setState({ status: 'ok', token })
          return
        }
        if (seed) {
          setState({ status: 'ok', token: seed })
          return
        }
        setState({ status: 'missing', pair: pairSeed })
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return
        if (seed) {
          setState({ status: 'ok', token: seed })
          return
        }
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to load token',
        })
      }
    }

    void load()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [mint, location.state])

  const token = state.status === 'ok' ? state.token : null
  const pair = state.status === 'missing' ? state.pair : seedPair
  const pool = token?.pool ?? null

  useEffect(() => {
    if (!mint || state.status === 'loading' || state.status === 'error') return

    const controller = new AbortController()
    let cancelled = false

    async function loadChart() {
      setChartState({ status: 'loading' })
      try {
        const chart = await resolveChartTarget(mint, pool, controller.signal)
        if (cancelled) return
        setChartState(chart ? { status: 'ok', chart } : { status: 'empty' })
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === 'AbortError')) return
        setChartState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Failed to resolve chart pair',
        })
      }
    }

    void loadChart()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [mint, pool, state.status])

  const displayName = token?.name ?? pair?.name ?? 'Unknown token'
  const displaySymbol = token?.symbol ?? pair?.symbol ?? (mint ? shortMint(mint) : '—')
  const image = logoSrc(token?.imageUrl ?? pair?.logoUrl)
  const quote = token?.quote
  const market = token?.market
  const priceChange =
    market?.priceChange24h ??
    (chartState.status === 'ok' ? chartState.chart.priceChange24h ?? null : null)
  const stonkUrl = tokenPageUrl(mint)
  const dexUrl = dexScreenerUrl(mint)
  const rayUrl = raydiumSwapUrl(mint, quote?.mint)

  async function copyMint() {
    try {
      await navigator.clipboard?.writeText(mint)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="page token-detail">
      <nav className="detail-back" aria-label="Back">
        <Link to={backTo} className="back-link">
          ← {backLabel}
        </Link>
      </nav>

      {state.status === 'loading' ? (
        <div className="skeleton-list" aria-hidden="true">
          <div className="skeleton-row" style={{ height: '7rem' }} />
          <div className="skeleton-row" style={{ height: '18rem' }} />
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className="error-panel" role="alert">
          <h2>Could not load token</h2>
          <p>{state.message}</p>
          <p className="error-hint">
            Mint <code>{mint}</code> — try again, or open{' '}
            <a href={dexUrl} target="_blank" rel="noreferrer">
              DexScreener
            </a>
            .
          </p>
        </div>
      ) : null}

      {state.status !== 'loading' && state.status !== 'error' ? (
        <>
          <header className="detail-hero">
            <div className="detail-identity">
              <div className="quote-logo detail-logo" aria-hidden="true">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling
                      if (fallback instanceof HTMLElement) fallback.hidden = false
                    }}
                  />
                ) : null}
                <span className="quote-logo-fallback" hidden={!!image}>
                  {displaySymbol.slice(0, 2)}
                </span>
              </div>
              <div className="detail-titles">
                <p className="live-pill detail-status">
                  <span className="live-dot" aria-hidden="true" />
                  {token?.status === 'graduated'
                    ? 'Graduated'
                    : token?.status
                      ? token.status
                      : pair
                        ? 'Launchable quote'
                        : 'Token'}
                </p>
                <h1>{displaySymbol}</h1>
                <p className="detail-name">{displayName}</p>
              </div>
            </div>

            <div className="detail-badges">
              {quote ? (
                <span className="badge quote-pair" title={quote.mint}>
                  vs {quote.symbol}
                </span>
              ) : null}
              {quote ? (
                <span className="badge category">{quote.categoryLabel || quote.category}</span>
              ) : pair ? (
                <span className="badge category">{pair.categoryLabel || pair.category}</span>
              ) : null}
              {token?.launchpad ? <span className="badge ready">{token.launchpad}</span> : null}
              {pair?.launchable ? <span className="badge live">launchable</span> : null}
            </div>

            <div className="detail-mint">
              <span className="mint-label">mint</span>
              <code title={mint}>{mint}</code>
              <button type="button" className="copy-btn" onClick={() => void copyMint()}>
                {copied ? 'copied' : 'copy'}
              </button>
            </div>
          </header>

          {state.status === 'missing' ? (
            <p className="detail-note">
              No StonkFun token record for this mint
              {pair ? ' — showing launchable quote details and a public chart when available.' : '.'}
            </p>
          ) : null}

          <section className="detail-stats" aria-label="Market stats">
            <div className="stat-tile">
              <span className="stat-label">Price</span>
              <strong>{formatPriceUsd(market?.priceUsd)}</strong>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Mcap</span>
              <strong>{formatUsd(market?.marketCapUsd)}</strong>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Volume 24h</span>
              <strong>{formatUsd(market?.volume24hUsd)}</strong>
            </div>
            <div className="stat-tile">
              <span className="stat-label">24h change</span>
              <strong
                className={
                  priceChange == null
                    ? undefined
                    : priceChange > 0
                      ? 'change-up'
                      : priceChange < 0
                        ? 'change-down'
                        : undefined
                }
              >
                {formatPercent(priceChange)}
              </strong>
            </div>
          </section>

          {token?.graduatedAt ? (
            <p className="detail-graduated" title={token.graduatedAt}>
              <span className="stat-label">Graduated</span>{' '}
              <time dateTime={token.graduatedAt}>{formatRelativeTime(token.graduatedAt)}</time>
              <span className="detail-graduated-abs">
                {' '}
                · {new Date(token.graduatedAt).toLocaleString()}
              </span>
            </p>
          ) : null}

          <div className="detail-links token-links">
            <a href={stonkUrl} target="_blank" rel="noreferrer">
              StonkFun
            </a>
            <a href={dexUrl} target="_blank" rel="noreferrer">
              DexScreener
            </a>
            <a href={rayUrl} target="_blank" rel="noreferrer">
              Raydium
            </a>
          </div>

          <PriceChart
            mint={mint}
            symbol={displaySymbol}
            status={chartState.status}
            errorMessage={chartState.status === 'error' ? chartState.message : undefined}
            embedUrl={chartState.status === 'ok' ? chartState.chart.embedUrl : null}
            externalUrl={chartState.status === 'ok' ? chartState.chart.externalUrl : null}
            pairAddress={chartState.status === 'ok' ? chartState.chart.pairAddress : null}
            dexFallbackUrl={dexUrl}
            geckoFallbackUrl={pool ? geckoTerminalPoolUrl(pool) : null}
          />
        </>
      ) : null}
    </div>
  )
}
