import { TokensBoardPage } from './TokensBoardPage'

const config = {
  tokenStatus: 'new' as const,
  cardVariant: 'new' as const,
  pill: 'Not graduated yet',
  title: 'New',
  lede:
    'Freshly created tokens still on the bonding curve — see graduation progress from the public API and open any card on StonkFun.',
  toolbarLabel: 'Filter new tokens',
  loadingLabel: 'Loading new tokens…',
  errorFallbackLabel: 'Could not load new tokens',
  emptyLabel: 'No new tokens match that filter.',
  rawApiUrl: 'https://www.stonkfun.xyz/api/public/v1/tokens?status=new&sort=newest&pageSize=24',
  paginationLabel: 'New tokens pages',
}

export function NewTokensPage() {
  return <TokensBoardPage config={config} />
}
