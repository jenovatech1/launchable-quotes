import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteShell } from './components/SiteShell'
import { GraduatedTokensPage } from './pages/GraduatedTokensPage'
import { TokenDetailPage } from './pages/TokenDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<GraduatedTokensPage />} />
        <Route path="graduated" element={<Navigate to="/" replace />} />
        <Route path="token/:mint" element={<TokenDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
