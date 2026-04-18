import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ patients: null, doctors: null, mappings: null });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [recentMappings, setRecentMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const initial = patients.length === 0 && doctors.length === 0 && recentMappings.length === 0;
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError('');

    const parseRows = (payload) => (Array.isArray(payload) ? payload : (payload?.results ?? []));
    let hadError = false;

    const patientsReq = api.get('/patients/', { ordering: '-created_at' }, { useCache: true, ttlMs: 120000 })
      .then((res) => {
        const rows = parseRows(res.data);
        setPatients(rows);
        setStats((prev) => ({ ...prev, patients: rows.length }));
      })
      .catch(() => {
        hadError = true;
        setStats((prev) => ({ ...prev, patients: 0 }));
      });

    const doctorsReq = api.get('/doctors/', { ordering: '-created_at' }, { useCache: true, ttlMs: 120000 })
      .then((res) => {
        const rows = parseRows(res.data);
        setDoctors(rows);
        setStats((prev) => ({ ...prev, doctors: rows.length }));
      })
      .catch(() => {
        hadError = true;
        setStats((prev) => ({ ...prev, doctors: 0 }));
      });

    const mappingsReq = api.get('/mappings/', { ordering: '-assigned_at' }, { useCache: true, ttlMs: 120000 })
      .then((res) => {
        const rows = parseRows(res.data);
        setRecentMappings(rows.slice(0, 8));
        setStats((prev) => ({ ...prev, mappings: rows.length }));
      })
      .catch(() => {
        hadError = true;
        setStats((prev) => ({ ...prev, mappings: 0 }));
      });

    await Promise.allSettled([patientsReq, doctorsReq, mappingsReq]);
    if (hadError) {
      setError('Some dashboard sections could not load. Please refresh and check backend connectivity.');
    }

    if (initial) setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    {
      label: 'Total Patients',   value: stats.patients,
      icon: '🧑‍⚕️', bg: 'rgba(62,54,176,.14)', link: '/patients', linkText: 'Manage patients',
      sub: 'Patient records in system',
    },
    {
      label: 'Doctors On File',  value: stats.doctors,
      icon: '👨‍⚕️', bg: 'rgba(28,159,143,.14)', link: '/doctors', linkText: 'Manage doctors',
      sub: 'Available clinical staff',
    },
    {
      label: 'Active Assignments', value: stats.mappings,
      icon: '🔗', bg: 'rgba(10,154,199,.14)', link: '/mappings', linkText: 'View assignments',
      sub: 'Patient-doctor pairings',
    },
  ];

  const genderStats = useMemo(() => {
    const counts = { male: 0, female: 0, other: 0 };
    patients.forEach((p) => {
      if (p.gender === 'male') counts.male += 1;
      else if (p.gender === 'female') counts.female += 1;
      else counts.other += 1;
    });
    return counts;
  }, [patients]);

  const specializationStats = useMemo(() => {
    const bucket = {};
    doctors.forEach((d) => {
      const key = d.specialization_display || 'General';
      bucket[key] = (bucket[key] || 0) + 1;
    });
    return Object.entries(bucket)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [doctors]);

  const availableDoctors = useMemo(() => doctors.filter((d) => d.is_available).length, [doctors]);
  const recentPatients = useMemo(() => patients.slice(0, 5), [patients]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="page-container">
      <div className="dashboard-header dashboard-hero">
        <div className="dashboard-header-top">
          <div>
            <h1 className="page-title" style={{ color: '#fff' }}>
              Good morning, {user?.name?.split(' ')[0] ?? 'Doctor'}
            </h1>
            <p>{today} · Real-time operational dashboard</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={load}>
              Refresh Data
            </button>
            <Link to="/patients" className="btn btn-primary">+ New Patient</Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="summary-chip">Realtime counts from API</span>
          <span className="summary-chip">Connected to patients, doctors, mappings</span>
          <span className="summary-chip">Available doctors: {availableDoctors}</span>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {refreshing && <div className="text-sm text-muted" style={{ marginBottom: '.6rem' }}>Refreshing dashboard data...</div>}

      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        {cards.map((c) => (
          <div key={c.label} className="stat-card">
            <div>
              <p className="stat-label">{c.label}</p>
              <div className="stat-num">{c.value ?? '...'}</div>
              <p className="stat-sub">{c.sub}</p>
              <Link to={c.link} className="text-sm" style={{ marginTop: '.4rem', display: 'inline-block' }}>
                {c.linkText} →
              </Link>
            </div>
            <div className="stat-icon" style={{ background: c.bg }}>
              <span style={{ fontSize: '1.6rem' }}>{c.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.05rem', marginBottom: '.9rem' }}>Quick Actions</h2>
          <div className="grid-auto">
            <Link to="/patients" className="quick-action">🧑‍⚕️ Add or edit patients</Link>
            <Link to="/doctors" className="quick-action">👨‍⚕️ Manage doctors and availability</Link>
            <Link to="/mappings" className="quick-action">🔗 Create patient-doctor assignment</Link>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.05rem', marginBottom: '.9rem' }}>Recent Assignments</h2>
          {loading ? (
            <div className="loading-center" style={{ padding: '1.2rem 0.5rem' }}>
              <div className="spinner" />
            </div>
          ) : recentMappings.length === 0 ? (
            <p className="text-sm text-muted">No recent assignments yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentMappings.slice(0, 5).map((mapping) => (
                <div key={mapping.id} className="summary-chip" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span>{mapping.patient_name} → Dr. {mapping.doctor_name}</span>
                  <span>
                    {new Date(mapping.assigned_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.05rem', marginBottom: '.9rem' }}>Gender Distribution</h2>
          <div className="analytics-bars">
            <div className="analytics-bar-row">
              <span>Male</span>
              <div className="analytics-track"><i style={{ width: `${stats.patients ? (genderStats.male / stats.patients) * 100 : 0}%` }} /></div>
              <strong>{genderStats.male}</strong>
            </div>
            <div className="analytics-bar-row">
              <span>Female</span>
              <div className="analytics-track"><i style={{ width: `${stats.patients ? (genderStats.female / stats.patients) * 100 : 0}%` }} /></div>
              <strong>{genderStats.female}</strong>
            </div>
            <div className="analytics-bar-row">
              <span>Other</span>
              <div className="analytics-track"><i style={{ width: `${stats.patients ? (genderStats.other / stats.patients) * 100 : 0}%` }} /></div>
              <strong>{genderStats.other}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.05rem', marginBottom: '.9rem' }}>Top Specializations</h2>
          <div className="analytics-bars">
            {specializationStats.length === 0 ? (
              <p className="text-sm text-muted">No specialization data yet.</p>
            ) : specializationStats.map((row) => (
              <div key={row.name} className="analytics-bar-row">
                <span>{row.name}</span>
                <div className="analytics-track"><i style={{ width: `${(row.total / Math.max(1, stats.doctors)) * 100}%` }} /></div>
                <strong>{row.total}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.05rem', marginBottom: '.9rem' }}>Newly Added Patients</h2>
        {recentPatients.length === 0 ? (
          <p className="text-sm text-muted">No patients found.</p>
        ) : (
          <div className="dashboard-list">
            {recentPatients.map((p) => (
              <div key={p.id} className="dashboard-list-row">
                <div>
                  <strong>{p.name}</strong>
                  <p className="text-sm text-muted">{p.email || 'No email'} · {p.blood_group || 'Unknown'}</p>
                </div>
                <span className="summary-chip">#{p.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
