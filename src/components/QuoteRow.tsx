import { useNavigate } from 'react-router-dom'
import { logoSrc } from '../api/stonkfun'
import { shortMint } from '../lib/format'
import type { QuotePair } from '../types/pairs'

type Props = {
  pair: QuotePair
  index: number
}

export function QuoteRow({ pair, index }: Props) {
  const navigate = useNavigate()
  const src = logoSrc(pair.logoUrl)

  function openDetail() {
    navigate(`/token/${pair.mint}`, { state: { pair, from: 'launchable' as const } })
  }

  return (
    <article
      className="quote-row is-clickable"
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
      aria-label={`Open ${pair.symbol} details`}
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
            {pair.symbol.slice(0, 2)}
          </span>
        </div>
        <div className="quote-names">
          <h2 className="quote-symbol">{pair.symbol}</h2>
          <p className="quote-name">{pair.name}</p>
        </div>
      </div>

      <div className="quote-meta">
        <span className="badge category">{pair.categoryLabel || pair.category}</span>
        {pair.launchable ? <span className="badge live">launchable</span> : null}
        {pair.launchLabReady ? <span className="badge ready">lab ready</span> : null}
        {pair.symbolAmbiguous ? <span className="badge warn">ambiguous</span> : null}
      </div>

      <div className="quote-mint" onClick={(e) => e.stopPropagation()}>
        <span className="mint-label">mint</span>
        <code title={pair.mint}>{shortMint(pair.mint)}</code>
        <button
          type="button"
          className="copy-btn"
          onClick={() => void navigator.clipboard?.writeText(pair.mint)}
          aria-label={`Copy mint for ${pair.symbol}`}
        >
          copy
        </button>
      </div>
    </article>
  )
}
