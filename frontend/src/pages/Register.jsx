import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', password2: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) return setError('Passwords do not match.');
    setLoading(true);
    const res = await register(form.name, form.email, form.password, form.password2);
    if (res.success) navigate('/dashboard');
    else { setError(res.message); setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-side">
          <h3>Set up your care workspace in minutes.</h3>
          <p>
            Register once, then organize patients, doctors, and assignments with a cleaner and faster interface.
          </p>
          <div className="auth-points">
            <div className="auth-point">✓ Easy onboarding</div>
            <div className="auth-point">✓ Secure API connection</div>
            <div className="auth-point">✓ Smooth responsive dashboard</div>
          </div>
        </div>

        <div className="auth-form">
          <div className="auth-icon" style={{ background: 'rgba(28,159,143,.14)' }}>
            <span style={{ fontSize: '1.75rem' }}>🏥</span>
          </div>

          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.55rem', marginBottom: '.2rem' }}>
            Create your account
          </h2>
          <p className="text-muted text-sm mb-6">Start with a free account and open your workspace.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text" className="form-control" required
                placeholder="Dr. Jane Doe"
                value={form.name} onChange={set('name')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-control" required
                placeholder="you@example.com"
                value={form.email} onChange={set('email')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className="form-control" required
                placeholder="Minimum 8 characters"
                value={form.password} onChange={set('password')}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.3rem' }}>
              <label className="form-label">Confirm Password</label>
              <input
                type="password" className="form-control" required
                placeholder="********"
                value={form.password2} onChange={set('password2')}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-sm text-muted mt-6">
            Already have an account? <Link to="/login" className="font-600">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
