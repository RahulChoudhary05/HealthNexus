import { useState, useEffect } from 'react';
import { api } from '../services/api';

/* ── helpers ───────────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', email: '', phone: '', date_of_birth: '',
  gender: 'prefer_not_to_say', blood_group: 'Unknown',
  address: '', medical_history: '', allergies: '',
  emergency_contact_name: '', emergency_contact_phone: '',
};

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>{title}</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '.3rem .7rem', fontSize: '1.2rem' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── component ─────────────────────────────────────────────────────────────── */
export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [showModal, setShow]    = useState(false);
  const [editing,   setEditing] = useState(null);   // patient object or null
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy]     = useState('newest');

  /* ── fetch ── */
  const load = async () => {
    const initialLoad = patients.length === 0;
    if (initialLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError('');
    try {
      const orderingMap = {
        newest: '-created_at',
        name_asc: 'name',
        name_desc: '-name',
        id_asc: 'id',
      };

      const { data } = await api.get('/patients/', {
        search: debouncedSearch,
        gender: genderFilter === 'all' ? '' : genderFilter,
        ordering: orderingMap[sortBy],
      }, { useCache: true, ttlMs: 120000 });
      setPatients(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setLoadError('Unable to load patients right now. Please check backend connection and try again.');
    }
    if (initialLoad) setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { load(); }, [debouncedSearch, genderFilter, sortBy]);

  /* ── open modal ── */
  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShow(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name:                    p.name ?? '',
      email:                   p.email ?? '',
      phone:                   p.phone ?? '',
      date_of_birth:           p.date_of_birth ?? '',
      gender:                  p.gender ?? 'prefer_not_to_say',
      blood_group:             p.blood_group ?? 'Unknown',
      address:                 p.address ?? '',
      medical_history:         p.medical_history ?? '',
      allergies:               p.allergies ?? '',
      emergency_contact_name:  p.emergency_contact_name ?? '',
      emergency_contact_phone: p.emergency_contact_phone ?? '',
    });
    setError('');
    setShow(true);
  };

  const f = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  /* ── save ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');

    // remove empty optional fields so they don't fail validation
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== '')
    );

    try {
      if (editing) await api.put(`/patients/${editing.id}/`, payload);
      else         await api.post('/patients/', payload);
      setShow(false);
      load();
    } catch (err) {
      const raw = err.response?.data;
      if (raw && typeof raw === 'object') {
        setError(Object.values(raw).flat().join(' '));
      } else {
        setError('Failed to save. Check the form and try again.');
      }
    }
    setSaving(false);
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    try { await api.delete(`/patients/${id}/`); load(); }
    catch { alert('Delete failed.'); }
  };

  /* ── render ── */
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">Manage all patient records created by you.</p>
          <div className="flex gap-2 mt-2">
            <span className="summary-chip">Total: {patients.length}</span>
            <span className="summary-chip">Scope: Current account</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Patient</button>
        </div>
      </div>

      {loadError && <div className="alert alert-error">{loadError}</div>}

      <div className="card filter-toolbar">
        <input
          className="form-control"
          placeholder="Search by name, email, phone, or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <option value="all">All genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Sort: Newest</option>
          <option value="name_asc">Sort: Name A-Z</option>
          <option value="name_desc">Sort: Name Z-A</option>
          <option value="id_asc">Sort: ID Asc</option>
        </select>
      </div>

      {refreshing && <div className="text-sm text-muted" style={{ margin: '.2rem 0 .8rem' }}>Refreshing patient list...</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Loading patients…</span></div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>🧑‍⚕️</div>
            <h3>No matching patients found</h3>
            <p className="text-sm text-muted">Try adjusting search or filters, or add a new patient.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Age / Gender</th>
                  <th>Blood</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fw-700">{p.name}</div>
                      <div className="text-xs text-light">ID #{p.id}</div>
                    </td>
                    <td>
                      <div className="text-sm">{p.email || '—'}</div>
                      <div className="text-xs text-muted">{p.phone || '—'}</div>
                    </td>
                    <td>
                      {p.age != null ? `${p.age} yrs` : '—'}
                      <span className="text-muted"> / </span>
                      <span className="text-sm">{p.gender ?? '—'}</span>
                    </td>
                    <td>
                      <span className="badge badge-blue">{p.blood_group}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary" style={{ padding: '.35rem .7rem', fontSize: '.8rem' }} onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn btn-danger"    style={{ padding: '.35rem .7rem', fontSize: '.8rem' }} onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <Modal title={editing ? 'Edit Patient' : 'Add New Patient'} onClose={() => setShow(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" required value={form.name} onChange={f('name')} placeholder="Jane Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" value={form.date_of_birth} onChange={f('date_of_birth')} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={f('email')} placeholder="patient@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={f('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-control" value={form.blood_group} onChange={f('blood_group')}>
                  {['Unknown','A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-control" rows={2} value={form.address} onChange={f('address')} placeholder="123 Main St, City" />
            </div>
            <div className="form-group">
              <label className="form-label">Medical History</label>
              <textarea className="form-control" rows={3} value={form.medical_history} onChange={f('medical_history')} placeholder="Hypertension, Diabetes…" />
            </div>
            <div className="form-group">
              <label className="form-label">Known Allergies</label>
              <input className="form-control" value={form.allergies} onChange={f('allergies')} placeholder="Penicillin, Peanuts…" />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Patient'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
