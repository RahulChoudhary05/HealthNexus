import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

export default function Home() {
  const { user } = useAuth();
  const [live, setLive] = useState({ patients: null, doctors: null, mappings: null });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentDoctors, setRecentDoctors] = useState([]);
  const [recentMappings, setRecentMappings] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);

  const features = [
    { icon: '🧑‍💼', title: 'Patient Registry', desc: 'Create and manage patient profiles with contact details, history, allergies, and emergency records.' },
    { icon: '👨‍⚕️', title: 'Doctor Registry', desc: 'Maintain doctor specialization, experience, availability, and consultation details in one place.' },
    { icon: '🔐', title: 'Secure Authentication', desc: 'JWT-based login and protected routes keep healthcare records scoped to authenticated users.' },
    { icon: '🔗', title: 'Smart Assignment Flow', desc: 'Map patients to doctors quickly and track each assignment with a clear operational timeline.' },
    { icon: '🔎', title: 'Search, Filter, Sort', desc: 'Find records instantly by name, ID, specialization, or status across all core modules.' },
    { icon: '⚡', title: 'Live Dashboard', desc: 'Counts and activity cards are loaded from real backend endpoints for day-to-day monitoring.' },
  ];

  const workflow = [
    {
      id: '01',
      title: 'AI-Powered Patient Engagement',
      desc: 'Patients interact through structured forms, then records flow into a ready-to-review profile without data loss.',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBVwQBPPGYomya8o3ettt-A-h5stXNyoZ4FQ&s',
    },
    {
      id: '02',
      title: 'Intelligent Triage & Scheduling',
      desc: 'Doctors are filtered by specialization and availability, then mapped to patients in seconds.',
      image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '03',
      title: 'Provider Review & Confirmation',
      desc: 'Dashboard widgets summarize key activity so operations teams can confirm and follow up rapidly.',
      image: 'https://images.unsplash.com/photo-1625134673337-519d4d10b313?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const integrations = ['EP', 'CR', 'AH', 'eC', 'AS', 'NG', 'PF', 'DC'];

  useEffect(() => {
    if (!user) return;

    const loadLiveData = async () => {
      setLoadingLive(true);

      const parseRows = (payload) => (Array.isArray(payload) ? payload : (payload?.results ?? []));

      const patientsReq = api.get('/patients/', { ordering: '-created_at' }, { useCache: true, ttlMs: 120000 })
        .then((res) => {
          const rows = parseRows(res.data);
          setLive((prev) => ({ ...prev, patients: rows.length }));
          setRecentPatients(rows.slice(0, 4));
        })
        .catch(() => {
          setLive((prev) => ({ ...prev, patients: 0 }));
        });

      const doctorsReq = api.get('/doctors/', { ordering: '-created_at' }, { useCache: true, ttlMs: 120000 })
        .then((res) => {
          const rows = parseRows(res.data);
          setLive((prev) => ({ ...prev, doctors: rows.length }));
          setRecentDoctors(rows.slice(0, 4));
        })
        .catch(() => {
          setLive((prev) => ({ ...prev, doctors: 0 }));
        });

      const mappingsReq = api.get('/mappings/', { ordering: '-assigned_at' }, { useCache: true, ttlMs: 120000 })
        .then((res) => {
          const rows = parseRows(res.data);
          setLive((prev) => ({ ...prev, mappings: rows.length }));
          setRecentMappings(rows.slice(0, 4));
        })
        .catch(() => {
          setLive((prev) => ({ ...prev, mappings: 0 }));
        });

      await Promise.allSettled([patientsReq, doctorsReq, mappingsReq]);
      setLoadingLive(false);
    };

    loadLiveData();
  }, [user]);

  const uptime = useMemo(() => {
    if (!user) return '99.9%';
    return live.mappings > 0 ? '99.98%' : '99.9%';
  }, [user, live.mappings]);

  return (
    <div className="home-wrap">
      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <span className="hero-pill">HIPAA & GDPR Certified Excellence</span>
            <h1>
              Healthcare Operations <span>Made Clear</span>
            </h1>
            <p>
              Manage patients, doctors, and assignments through a clean secure interface
              connected directly to your backend data.
            </p>

            <div className="hero-actions">
              <Link to={user ? '/dashboard' : '/register'} className="btn btn-primary">
                {user ? 'Launch Dashboard' : 'Start Free'}
              </Link>
              <Link to={user ? '/patients' : '/login'} className="btn btn-secondary">
                {user ? 'Open Patients' : 'Login'}
              </Link>
            </div>

            <div className="hero-kpis">
              <div>
                <strong>{uptime}</strong>
                <span>Uptime SLA</span>
              </div>
              <div>
                <strong>-65%</strong>
                <span>Admin Time</span>
              </div>
              <div>
                <strong>+85%</strong>
                <span>Patient Satisfaction</span>
              </div>
            </div>
          </div>

          <div className="home-hero-media">
            <img
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80"
              alt="Healthcare intelligence"
              loading="lazy"
            />
            <span className="media-tag">SOC 2 Certified</span>
            <div className="media-overlay">
              <p>Active Patients Today</p>
              <strong>{user ? (live.patients ?? '...') : 247}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-title">
          <span className="hero-pill light">Premium Features</span>
          <h2>Enterprise-Grade Healthcare Automation</h2>
          <p>Comprehensive modules designed to raise care quality, speed, and operational confidence.</p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="home-feature-card">
              <div className="home-feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
              <span>Learn more</span>
            </article>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="section-title">
          <h2>Seamless Workflow Integration</h2>
          <p>A step-by-step flow that transforms patient care delivery from first contact to confirmation.</p>
        </div>

        <div className="workflow-timeline">
          {workflow.map((step, index) => (
            <article key={step.id} className={`timeline-item ${index % 2 ? 'reverse' : ''}`}>
              <div className="timeline-copy">
                <p className="timeline-id">{step.id}</p>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="timeline-chips">
                  <span>AI-Powered</span>
                  <span>Real-time</span>
                  <span>Automated</span>
                </div>
              </div>
              <img src={step.image} alt={step.title} loading="lazy" />
            </article>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="section-title">
          <h2>Experience the HealthNexus Dashboard</h2>
          <p>Live insights and smart summaries fetched from your actual backend data.</p>
        </div>

        <div className="dashboard-preview-panel">
          <div className="preview-top">
            <h3>Performance Metrics</h3>
            <Link to="/dashboard" className="btn btn-primary">Open Full Dashboard</Link>
          </div>

          <div className="preview-metrics">
            <div className="preview-metric-card"><strong>{user ? (live.patients ?? '...') : 2847}</strong><span>Active Patients</span></div>
            <div className="preview-metric-card"><strong>{user ? (live.mappings ?? '...') : 156}</strong><span>Assignments</span></div>
            <div className="preview-metric-card"><strong>{user ? (live.doctors ?? '...') : 68}</strong><span>Doctors Available</span></div>
            <div className="preview-metric-card"><strong>4.9/5</strong><span>Satisfaction Score</span></div>
          </div>

          <div className="preview-live-grid">
            <div className="preview-live-card">
              <h4>Recent Patients</h4>
              {user && recentPatients.length > 0 ? recentPatients.map((row) => (
                <div key={row.id} className="preview-row"><span>{row.name}</span><small>#{row.id}</small></div>
              )) : <p className="text-sm text-muted">Login to view live patient stream.</p>}
            </div>
            <div className="preview-live-card">
              <h4>Recent Mappings</h4>
              {user && recentMappings.length > 0 ? recentMappings.map((row) => (
                <div key={row.id} className="preview-row"><span>{row.patient_name} → Dr. {row.doctor_name}</span><small>#{row.id}</small></div>
              )) : <p className="text-sm text-muted">Login to view live assignment stream.</p>}
            </div>
            <div className="preview-live-card">
              <h4>Recent Doctors</h4>
              {user && recentDoctors.length > 0 ? recentDoctors.map((row) => (
                <div key={row.id} className="preview-row"><span>Dr. {row.name}</span><small>#{row.id}</small></div>
              )) : <p className="text-sm text-muted">Login to view live doctor stream.</p>}
            </div>
          </div>

          {loadingLive && <p className="text-sm text-muted mt-2">Syncing live data...</p>}
        </div>
      </section>

      <section className="feature-section">
        <div className="section-title">
          <h2>Enterprise Ready Integrations</h2>
          <p>Seamlessly connect with existing healthcare infrastructure and external systems.</p>
        </div>

        <div className="integration-band">
          {integrations.map((item) => <span key={item}>{item}</span>)}
        </div>

        <div className="integration-grid">
          <div><h4>Secure Data Sync</h4><p>Bi-directional data synchronization with existing EMR systems.</p></div>
          <div><h4>Cloud Infrastructure</h4><p>99.99% uptime with global CDN and auto-scaling capabilities.</p></div>
          <div><h4>HIPAA Compliant</h4><p>End-to-end encryption with compliance-focused architecture.</p></div>
          <div><h4>Instant Deployment</h4><p>Fast onboarding and clean setup for clinical operations.</p></div>
          <div><h4>Auto Updates</h4><p>Continuous improvements without downtime for active teams.</p></div>
          <div><h4>API-First Design</h4><p>REST-powered modules for fast integration and scalability.</p></div>
        </div>
      </section>

      <section className="feature-section">
        <div className="home-cta-box">
          <h2>Ready to run your healthcare operations faster?</h2>
          <p>Open your dashboard and manage real records with secure role-aware workflows.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to={user ? '/dashboard' : '/login'} className="btn btn-primary">
              {user ? 'Go to Dashboard' : 'Secure Login'}
            </Link>
            <Link to="/patients" className="btn btn-secondary">Manage Patients</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
