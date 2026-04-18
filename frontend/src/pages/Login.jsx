import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const res = await login(form.email, form.password);
    if (res.success) navigate('/dashboard');
    else { setError(res.message); setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <h3>One dashboard for your full healthcare workflow.</h3>
          <p>
            Access secure patient records, doctor availability, and assignments in a single connected experience.
          </p>
          <div className="auth-points">
            <div className="auth-point">✓ Protected JWT session</div>
            <div className="auth-point">✓ Real-time dashboard cards</div>
            <div className="auth-point">✓ Responsive on mobile and desktop</div>
          </div>
        </div>

        <div className="auth-form">
          <div className="auth-icon" style={{ background: 'rgba(62,54,176,.12)' }}>
            <span style={{ fontSize: '1.75rem' }}>🔐</span>
          </div>

          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.55rem', marginBottom: '.2rem' }}>
            Welcome back
          </h2>
          <p className="text-muted text-sm mb-6">Login to continue managing patients and doctors.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-control" required
                placeholder="you@example.com"
                value={form.email} onChange={set('email')}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.3rem' }}>
              <label className="form-label">Password</label>
              <input
                type="password" className="form-control" required
                placeholder="********"
                value={form.password} onChange={set('password')}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-sm text-muted mt-6">
            No account? <Link to="/register" className="font-600">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
