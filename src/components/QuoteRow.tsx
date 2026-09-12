import { useEffect, useRef, useState } from 'react'
import { logoSrc } from '../api/stonkfun'
import type { QuotePair } from '../types/pairs'

type Props = {
  pair: QuotePair
  index: number
}

function shortMint(mint: string): string {
  if (mint.length <= 12) return mint
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`
}

export function QuoteRow({ pair, index }: Props) {
  const src = logoSrc(pair.logoUrl)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (copiedTimer.current != null) window.clearTimeout(copiedTimer.current)
    }
  }, [])

  async function copyMint() {
    try {
      await navigator.clipboard.writeText(pair.mint)
      setCopied(true)
      if (copiedTimer.current != null) window.clearTimeout(copiedTimer.current)
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <article className="quote-row" style={{ animationDelay: `${Math.min(index, 24) * 18}ms` }}>
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

      <div className="quote-mint">
        <span className="mint-label">mint</span>
        <code title={pair.mint}>{shortMint(pair.mint)}</code>
        <button
          type="button"
          className={copied ? 'copy-btn copied' : 'copy-btn'}
          onClick={() => void copyMint()}
          aria-label={copied ? `Copied mint for ${pair.symbol}` : `Copy mint for ${pair.symbol}`}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </article>
  )
}
