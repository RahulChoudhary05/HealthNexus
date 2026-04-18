import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div>
          <div className="nav-brand" style={{ marginBottom: '.55rem' }}>
            <span className="nav-brand-mark" aria-hidden="true">
              <span className="pulse-dot" />
              <span className="pulse-line" />
            </span>
            <span><strong>Health</strong>Nexus</span>
          </div>
          <p className="text-sm text-muted" style={{ maxWidth: '34ch' }}>
            Built for modern clinics to manage patients, doctors, and care assignments with a smooth digital workflow.
          </p>
        </div>

        <div className="footer-links">
          <h4>Product</h4>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/patients">Patients</Link>
          <Link to="/doctors">Doctors</Link>
          <Link to="/mappings">Mappings</Link>
        </div>

        <div className="footer-links">
          <h4>Company</h4>
          <p>About</p>
          <p>Careers</p>
          <p>Contact</p>
          <p>Terms and Privacy</p>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© 2026 HealthNexus. All rights reserved.</span>
        <span>Digital healthcare workflow platform.</span>
      </div>
    </footer>
  );
}
