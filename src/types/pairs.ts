export type QuotePair = {
  mint: string
  symbol: string
  name: string
  decimals: number
  logoUrl?: string | null
  category: string
  categoryLabel: string
  tokenProgram?: string
  launchable: boolean
  symbolAmbiguous?: boolean
  launchLabReady?: boolean
}

export type PairsResponse = {
  data: {
    pairs: QuotePair[]
  }
  meta?: {
    generatedAt?: string
  }
}

export type FetchState =
  | { status: 'loading' }
  | { status: 'ok'; pairs: QuotePair[]; generatedAt: string | null; fetchedAt: Date }
  | { status: 'error'; message: string }
