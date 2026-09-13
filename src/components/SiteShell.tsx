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
            <NavLink
              to="/graduated"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Graduated
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          Unofficial free tool. Data from{' '}
          <a href="https://www.stonkfun.xyz/api/public/v1" target="_blank" rel="noreferrer">
            StonkFun public API
          </a>
          . Not affiliated with StonkFun.
        </p>
      </footer>
    </div>
  )
}
