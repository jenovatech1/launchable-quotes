import { useNavigate } from 'react-router-dom'
import { dexScreenerUrl, logoSrc, raydiumSwapUrl, tokenPageUrl } from '../api/stonkfun'
import { formatPercent, formatRelativeTime, formatUsd } from '../lib/format'
import type { GraduatedToken } from '../types/tokens'

type Props = {
  token: GraduatedToken
  index: number
}

export function GraduatedTokenCard({ token, index }: Props) {
  const navigate = useNavigate()
  const src = logoSrc(token.imageUrl)
  const quoteSrc = logoSrc(token.quote.logoUrl)
  const quoteLabel = token.quote.categoryLabel || token.quote.category
  const stonkUrl = tokenPageUrl(token.mint)
  const dexUrl = dexScreenerUrl(token.mint)
  const rayUrl = raydiumSwapUrl(token.mint, token.quote.mint)
  const detailPath = `/token/${token.mint}`
  const priceChange = token.market?.priceChange24h
  const changeClass =
    priceChange == null
      ? undefined
      : priceChange > 0
        ? 'change-up'
        : priceChange < 0
          ? 'change-down'
          : undefined

  function openDetail() {
    navigate(detailPath, { state: { token, from: 'graduated' as const } })
  }

  return (
    <article
      className="token-card is-clickable"
      style={{ animationDelay: `${Math.min(index, 24) * 28}ms` }}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openDetail()
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${token.symbol} details`}
    >
      <div className="token-card-watermark" aria-hidden="true">
        {quoteSrc ? (
          <img src={quoteSrc} alt="" loading="lazy" />
        ) : (
          <span>{token.quote.symbol.slice(0, 1)}</span>
        )}
      </div>

      <div className="token-card-top">
        <div className="token-card-avatar" aria-hidden="true">
          {src ? (
            <img
              src={src}
              alt=""
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextElementSibling
                if (fallback instanceof HTMLElement) fallback.hidden = false
              }}
            />
          ) : null}
          <span className="token-card-avatar-fallback" hidden={!!src}>
            {token.symbol.slice(0, 2)}
          </span>
        </div>

        <div className="token-card-actions" onClick={(e) => e.stopPropagation()}>
          <a
            className="card-icon-btn"
            href={stonkUrl}
            target="_blank"
            rel="noreferrer"
            title="Open on StonkFun"
            aria-label={`Open ${token.symbol} on StonkFun`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"
              />
            </svg>
          </a>
          <a
            className="card-icon-btn"
            href={dexUrl}
            target="_blank"
            rel="noreferrer"
            title="DexScreener"
            aria-label={`DexScreener for ${token.symbol}`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 7h3V5H5v5h2V7zm7-2v2h3v3h2V5h-5zm3 12h-3v2h5v-5h-2v3zM7 14H5v5h5v-2H7v-3z"
              />
            </svg>
          </a>
          <a
            className="card-icon-btn"
            href={rayUrl}
            target="_blank"
            rel="noreferrer"
            title="Raydium swap"
            aria-label={`Swap ${token.symbol} on Raydium`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7.5 4 4 8.5 7.5 13H10L6.8 8.5 10 4H7.5zm9 0H14l3.2 4.5L14 13h2.5L20 8.5 16.5 4zM12 10l-1.2 2H5v2h5.2L12 18l1.8-4H19v-2h-5.8L12 10z"
              />
            </svg>
          </a>
          <button
            type="button"
            className="card-icon-btn ca-btn"
            onClick={() => void navigator.clipboard?.writeText(token.mint)}
            title="Copy mint"
            aria-label={`Copy mint for ${token.symbol}`}
          >
            CA
          </button>
        </div>
      </div>

      <div className="token-card-identity">
        <h2 className="token-card-symbol">${token.symbol}</h2>
        <p className="token-card-name">{token.name}</p>
      </div>

      <p className="token-card-mcap">{formatUsd(token.market?.marketCapUsd)}</p>

      <div className="token-card-pair">
        <span className="paired-label">Paired with</span>
        <span className="paired-quote">
          {quoteSrc ? (
            <img src={quoteSrc} alt="" className="paired-logo" loading="lazy" />
          ) : (
            <span className="paired-logo-fallback" aria-hidden="true">
              {token.quote.symbol.slice(0, 1)}
            </span>
          )}
          <span className="paired-symbol">{token.quote.symbol}</span>
        </span>
        <span className="badge category">{quoteLabel}</span>
      </div>

      <div className="token-card-footer">
        <div className="token-card-stats">
          <span>
            Vol <strong>{formatUsd(token.market?.volume24hUsd)}</strong>
          </span>
          <span className={changeClass}>{formatPercent(priceChange)}</span>
        </div>
        <time className="token-card-graduated" dateTime={token.graduatedAt ?? undefined} title={token.graduatedAt ?? undefined}>
          {formatRelativeTime(token.graduatedAt)}
        </time>
      </div>
    </article>
  )
}
