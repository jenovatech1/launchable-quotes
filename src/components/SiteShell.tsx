import { NavLink, Outlet } from 'react-router-dom'

export function SiteShell() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" end>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">
              <span className="brand-name">Launchable Quotes Live</span>
              <span className="brand-sub">for StonkFun · by @jenovatech</span>
            </span>
          </NavLink>
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Launchable
            </NavLink>
            <span className="nav-link muted" title="Coming later in this repo">
              Custom Pairs Radar
            </span>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          Unofficial free tool. Data from{' '}
          <a href="https://www.stonkfun.xyz/api/public/v1/pairs?launchable=true" target="_blank" rel="noreferrer">
            StonkFun public API
          </a>
          . Not affiliated with StonkFun.
        </p>
      </footer>
    </div>
  )
}
