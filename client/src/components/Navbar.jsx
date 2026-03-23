import { NavLink } from 'react-router-dom';

function closeMenu() {
  const menu = document.getElementById('navmenu');
  if (menu?.classList.contains('show')) {
    document.querySelector('.navbar-toggler')?.click();
  }
}

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-sm sticky-top">
      <div className="container">
        <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/logo.png" alt="BiteBook" style={{ height: 50, width: 50, objectFit: 'contain' }} />
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <span style={{ color: 'var(--bb-white)' }}>BITE</span><span style={{ color: 'var(--bb-action)' }}>BOOK</span>
            </div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bb-label)', marginTop: 2 }}>Personal Bass Log</div>
          </div>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navmenu"
          style={{ borderColor: 'rgba(255,255,255,0.5)' }}
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
        </button>
        <div className="collapse navbar-collapse" id="navmenu">
          <ul className="navbar-nav ms-auto">
            {[
              { to: '/',        label: 'Log'      },
              { to: '/add',     label: 'Add'      },
              { to: '/map',     label: 'Map'      },
              { to: '/stats',   label: 'Stats'    },
              { to: '/settings',label: 'Settings' },
            ].map(({ to, label }) => (
              <li key={to} className="nav-item">
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`}
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
