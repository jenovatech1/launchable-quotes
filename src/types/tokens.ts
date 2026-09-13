export type TokenQuote = {
  mint: string
  symbol: string
  name: string
  logoUrl?: string | null
  category: string
  categoryLabel: string
}

export type TokenMarket = {
  priceUsd?: number | null
  marketCapUsd?: number | null
  fdvUsd?: number | null
  volume24hUsd?: number | null
  liquidityUsd?: number | null
  priceChange24h?: number | null
  peakMarketCapUsd?: number | null
}

export type GraduatedToken = {
  mint: string
  pool?: string | null
  name: string
  symbol: string
  quote: TokenQuote
  imageUrl?: string | null
  launchpad?: string | null
  mode?: string | null
  links?: Record<string, string | undefined> | null
  market?: TokenMarket | null
  status: string
  graduationProgress?: number | null
  graduatedAt?: string | null
  createdAt?: string | null
}

export type TokensPagination = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type GraduatedTokensResult = {
  tokens: GraduatedToken[]
  pagination: TokensPagination
  generatedAt: string | null
}

export type GraduatedFetchState =
  | { status: 'loading' }
  | {
      status: 'ok'
      tokens: GraduatedToken[]
      pagination: TokensPagination
      generatedAt: string | null
      fetchedAt: Date
    }
  | { status: 'error'; message: string }
