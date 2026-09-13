type Props = {
  embedUrl: string | null
  externalUrl: string | null
  pairAddress: string | null
  status: 'loading' | 'ok' | 'empty' | 'error'
  errorMessage?: string
  mint: string
  symbol?: string
  dexFallbackUrl: string
  geckoFallbackUrl: string | null
}

export function PriceChart({
  embedUrl,
  externalUrl,
  pairAddress,
  status,
  errorMessage,
  mint,
  symbol,
  dexFallbackUrl,
  geckoFallbackUrl,
}: Props) {
  const label = symbol ? `${symbol} chart` : 'Price chart'

  return (
    <section className="chart-panel" aria-label={label}>
      <div className="chart-header">
        <h2>Price chart</h2>
        {status === 'ok' && pairAddress ? (
          <p className="chart-meta">
            GeckoTerminal embed · pair <code title={pairAddress}>{shortAddr(pairAddress)}</code>
          </p>
        ) : (
          <p className="chart-meta">Free embed · no API key</p>
        )}
      </div>

      {status === 'loading' ? <div className="chart-skeleton" aria-hidden="true" /> : null}

      {status === 'ok' && embedUrl ? (
        <div className="chart-frame-wrap">
          <iframe
            className="chart-frame"
            title={label}
            src={embedUrl}
            loading="lazy"
            allow="clipboard-write"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}

      {status === 'empty' || status === 'error' ? (
        <div className="chart-fallback" role="status">
          <p>
            {status === 'error'
              ? `Could not resolve a chart pair${errorMessage ? ` (${errorMessage})` : ''}.`
              : 'No public DEX pair found for this mint yet.'}
          </p>
          <p>
            Open{' '}
            <a href={dexFallbackUrl} target="_blank" rel="noreferrer">
              DexScreener
            </a>
            {geckoFallbackUrl ? (
              <>
                {' '}
                or{' '}
                <a href={geckoFallbackUrl} target="_blank" rel="noreferrer">
                  GeckoTerminal
                </a>
              </>
            ) : null}{' '}
            for an external chart.
          </p>
        </div>
      ) : null}

      {status === 'ok' && pairAddress && externalUrl ? (
        <p className="chart-links">
          <a href={externalUrl} target="_blank" rel="noreferrer">
            Open full chart
          </a>
          <a href={`https://dexscreener.com/solana/${pairAddress}`} target="_blank" rel="noreferrer">
            DexScreener
          </a>
          <a
            href={`https://www.geckoterminal.com/solana/pools/${pairAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            GeckoTerminal
          </a>
        </p>
      ) : null}

      {/* mint kept for a11y context / future noscript fallbacks */}
      <span className="sr-only">Token mint {mint}</span>
    </section>
  )
}

function shortAddr(value: string): string {
  if (value.length <= 12) return value
  return `${value.slice(0, 4)}…${value.slice(-4)}`
}
