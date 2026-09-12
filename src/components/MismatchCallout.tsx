type Props = {
  apiCount: number | null
  xstockCount: number | null
  generatedAt: string | null
}

export function MismatchCallout({ apiCount, xstockCount, generatedAt }: Props) {
  const countLabel = apiCount == null ? '…' : String(apiCount)
  const xLabel = xstockCount == null ? '…' : String(xstockCount)

  return (
    <section className="mismatch" aria-labelledby="mismatch-title">
      <div className="mismatch-badge">UI ↔ API</div>
      <h2 id="mismatch-title">Launch UI can say empty while the public API still lists launchable quotes</h2>
      <p>
        StonkFun’s launch screen sometimes reports no xStocks available. The public endpoint{' '}
        <code>GET /api/public/v1/pairs?launchable=true</code> is already returning live pairs — currently{' '}
        <strong>{countLabel}</strong> launchable
        {xstockCount != null ? (
          <>
            {' '}
            including <strong>{xLabel}</strong> xStock
            {xstockCount === 1 ? '' : 's'}
          </>
        ) : null}
        . This page reads that API directly so you can see the mismatch without guessing.
      </p>
      {generatedAt ? (
        <p className="mismatch-meta">API generatedAt: {new Date(generatedAt).toLocaleString()}</p>
      ) : null}
    </section>
  )
}
