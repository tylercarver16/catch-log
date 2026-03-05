import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-sm sticky-top">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">Catch Log</NavLink>
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
              { to: '/settings',label: 'Settings' },
            ].map(({ to, label }) => (
              <li key={to} className="nav-item">
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`}
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
