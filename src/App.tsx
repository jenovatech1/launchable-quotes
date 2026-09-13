import { useEffect } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { tokenPageUrl } from './api/stonkfun'
import { SiteShell } from './components/SiteShell'
import { GraduatedTokensPage } from './pages/GraduatedTokensPage'
import { NewTokensPage } from './pages/NewTokensPage'

/** Legacy deep links: send old /token/:mint URLs straight to StonkFun. */
function RedirectTokenToStonkFun() {
  const { mint = '' } = useParams<{ mint: string }>()

  useEffect(() => {
    if (!mint) return
    window.location.replace(tokenPageUrl(mint))
  }, [mint])

  return (
    <p className="empty" role="status">
      Opening on StonkFun…
    </p>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<GraduatedTokensPage />} />
        <Route path="new" element={<NewTokensPage />} />
        <Route path="graduated" element={<Navigate to="/" replace />} />
        <Route path="token/:mint" element={<RedirectTokenToStonkFun />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
