import { TokensBoardPage } from './TokensBoardPage'

const config = {
  tokenStatus: 'new' as const,
  cardVariant: 'new' as const,
  pill: 'Closest to graduate',
  title: 'New',
  lede:
    'Not-yet-graduated tokens ranked by graduation progress (highest first) — see how close each one is and open any card on StonkFun.',
  toolbarLabel: 'Filter new tokens',
  loadingLabel: 'Loading near-graduation tokens…',
  errorFallbackLabel: 'Could not load new tokens',
  emptyLabel: 'No new tokens match that filter.',
  rawApiUrl: 'https://www.stonkfun.xyz/api/public/v1/tokens?status=new&sort=volume&pageSize=100',
  paginationLabel: 'New tokens pages',
  sortSummary: 'closest to graduate first',
}

export function NewTokensPage() {
  return <TokensBoardPage config={config} />
}
