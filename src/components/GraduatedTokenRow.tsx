import { useNavigate } from 'react-router-dom'
import { dexScreenerUrl, logoSrc, raydiumSwapUrl, tokenPageUrl } from '../api/stonkfun'
import { formatRelativeTime, formatUsd, shortMint } from '../lib/format'
import type { GraduatedToken } from '../types/tokens'

type Props = {
  token: GraduatedToken
  index: number
}

export function GraduatedTokenRow({ token, index }: Props) {
  const navigate = useNavigate()
  const src = logoSrc(token.imageUrl)
  const quoteLabel = token.quote.categoryLabel || token.quote.category
  const stonkUrl = tokenPageUrl(token.mint)
  const dexUrl = dexScreenerUrl(token.mint)
  const rayUrl = raydiumSwapUrl(token.mint, token.quote.mint)
  const detailPath = `/token/${token.mint}`

  function openDetail() {
    navigate(detailPath, { state: { token, from: 'graduated' as const } })
  }

  return (
    <article
      className="token-row is-clickable"
      style={{ animationDelay: `${Math.min(index, 24) * 18}ms` }}
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
      <div className="quote-identity">
        <div className="quote-logo" aria-hidden="true">
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
          <span className="quote-logo-fallback" hidden={!!src}>
            {token.symbol.slice(0, 2)}
          </span>
        </div>
        <div className="quote-names">
          <h2 className="quote-symbol">{token.symbol}</h2>
          <p className="quote-name">{token.name}</p>
        </div>
      </div>

      <div className="token-mid">
        <div className="quote-meta">
          <span className="badge quote-pair" title={token.quote.mint}>
            vs {token.quote.symbol}
          </span>
          <span className="badge category">{quoteLabel}</span>
          {token.launchpad ? <span className="badge ready">{token.launchpad}</span> : null}
        </div>
        <div className="token-stats">
          <span>
            <span className="stat-label">mcap</span> {formatUsd(token.market?.marketCapUsd)}
          </span>
          <span>
            <span className="stat-label">vol</span> {formatUsd(token.market?.volume24hUsd)}
          </span>
        </div>
      </div>

      <div className="token-aside">
        <div className="graduated-time" title={token.graduatedAt ?? undefined}>
          <span className="stat-label">graduated</span>
          <time dateTime={token.graduatedAt ?? undefined}>
            {formatRelativeTime(token.graduatedAt)}
          </time>
        </div>
        <div className="token-links" onClick={(e) => e.stopPropagation()}>
          <a href={stonkUrl} target="_blank" rel="noreferrer">
            StonkFun
          </a>
          <a href={dexUrl} target="_blank" rel="noreferrer">
            Dex
          </a>
          <a href={rayUrl} target="_blank" rel="noreferrer">
            Raydium
          </a>
        </div>
        <div className="quote-mint" onClick={(e) => e.stopPropagation()}>
          <span className="mint-label">mint</span>
          <code title={token.mint}>{shortMint(token.mint)}</code>
          <button
            type="button"
            className="copy-btn"
            onClick={() => void navigator.clipboard?.writeText(token.mint)}
            aria-label={`Copy mint for ${token.symbol}`}
          >
            copy
          </button>
        </div>
      </div>
    </article>
  )
}
