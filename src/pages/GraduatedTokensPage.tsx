import { TokensBoardPage } from './TokensBoardPage'

const config = {
  tokenStatus: 'graduated' as const,
  cardVariant: 'graduated' as const,
  pill: 'Just graduated',
  title: 'Graduated',
  lede:
    'Newest StonkFun graduations first — filter by quote pair, browse the card board, open any token on StonkFun.',
  toolbarLabel: 'Filter graduated tokens',
  loadingLabel: 'Loading graduated tokens…',
  errorFallbackLabel: 'Could not load graduated tokens',
  emptyLabel: 'No graduated tokens match that filter.',
  rawApiUrl:
    'https://www.stonkfun.xyz/api/public/v1/tokens?status=graduated&sort=newest&pageSize=24',
  paginationLabel: 'Graduated tokens pages',
  sortSummary: 'newest first',
}

export function GraduatedTokensPage() {
  return <TokensBoardPage config={config} />
}
