import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const active = (p) => pathname === p ? 'nav-link active' : 'nav-link';

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        <span className="nav-brand-mark" aria-hidden="true">
          <span className="pulse-dot" />
          <span className="pulse-line" />
        </span>
        <span>
          <strong>Health</strong>Nexus
        </span>
      </Link>

      <button
        className="nav-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {user ? (
          <>
            <Link to="/dashboard" className={active('/dashboard')} onClick={closeMenu}>Dashboard</Link>
            <Link to="/patients" className={active('/patients')} onClick={closeMenu}>Patients</Link>
            <Link to="/doctors" className={active('/doctors')} onClick={closeMenu}>Doctors</Link>
            <Link to="/mappings" className={active('/mappings')} onClick={closeMenu}>Assignments</Link>
          </>
        ) : (
          <>
            <Link to="/" className={active('/')} onClick={closeMenu}>Home</Link>
            <Link to="/login" className={active('/login')} onClick={closeMenu}>Login</Link>
          </>
        )}
        </div>

        <div className="nav-cta">
          {user ? (
            <>
              <span className="nav-user">{user.name}</span>
              <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '.85rem', padding: '.45rem .9rem' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/register" className="btn btn-primary" onClick={closeMenu} style={{ fontSize: '.9rem' }}>
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
