import { NavLink, Outlet } from 'react-router-dom'

export function SiteShell() {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand" end>
            <span className="brand-mark" aria-hidden="true" />
            <span className="brand-text">
              <span className="brand-name">Graduated</span>
              <span className="brand-sub">StonkFun board · @jenovatech</span>
            </span>
          </NavLink>
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            <a
              className="nav-link external"
              href="https://www.stonkfun.xyz/"
              target="_blank"
              rel="noreferrer"
            >
              StonkFun
            </a>
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          Unofficial free tool by{' '}
          <a href="https://x.com/jenovatech" target="_blank" rel="noreferrer">
            @jenovatech
          </a>
          . Data from{' '}
          <a href="https://www.stonkfun.xyz/api/public/v1" target="_blank" rel="noreferrer">
            StonkFun public API
          </a>
          . Not affiliated with StonkFun.
        </p>
      </footer>
    </div>
  )
}
