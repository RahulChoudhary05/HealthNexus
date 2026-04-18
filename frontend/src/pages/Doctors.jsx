import { useState, useEffect } from 'react';
import { api } from '../services/api';

const SPECS = [
  ['general_practice','General Practice'],['cardiology','Cardiology'],
  ['dermatology','Dermatology'],['endocrinology','Endocrinology'],
  ['gastroenterology','Gastroenterology'],['neurology','Neurology'],
  ['oncology','Oncology'],['ophthalmology','Ophthalmology'],
  ['orthopedics','Orthopedics'],['pediatrics','Pediatrics'],
  ['psychiatry','Psychiatry'],['pulmonology','Pulmonology'],
  ['radiology','Radiology'],['surgery','Surgery'],['urology','Urology'],['other','Other'],
];

const EMPTY = {
  name: '', email: '', phone: '', specialization: 'general_practice',
  license_number: '', experience_years: '', hospital: '',
  consultation_fee: '', is_available: true,
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

export default function Doctors() {
  const [doctors,  setDoctors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [showModal,setShow]     = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [search, setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('name_asc');

  const load = async () => {
    const initialLoad = doctors.length === 0;
    if (initialLoad) setLoading(true);
    else setRefreshing(true);
    setLoadError('');
    try {
      const orderingMap = {
        name_asc: 'name',
        name_desc: '-name',
        exp_desc: '-experience_years',
        fee_asc: 'consultation_fee',
      };

      const { data } = await api.get('/doctors/', {
        search: debouncedSearch,
        specialization: specFilter === 'all' ? '' : specFilter,
        is_available: availability === 'all' ? '' : availability,
        ordering: orderingMap[sortBy],
      }, { useCache: true, ttlMs: 120000 });
      setDoctors(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setLoadError('Unable to load doctors right now. Please retry in a moment.');
    }
    if (initialLoad) setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { load(); }, [debouncedSearch, specFilter, availability, sortBy]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setError(''); setShow(true); };
  const openEdit = (d) => {
    setEditing(d);
    setForm({
      name: d.name ?? '', email: d.email ?? '', phone: d.phone ?? '',
      specialization: d.specialization ?? 'general_practice',
      license_number: d.license_number ?? '', experience_years: d.experience_years ?? '',
      hospital: d.hospital ?? '', consultation_fee: d.consultation_fee ?? '',
      is_available: d.is_available ?? true,
    });
    setError(''); setShow(true);
  };

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const fBool = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));
    try {
      if (editing) await api.put(`/doctors/${editing.id}/`, payload);
      else         await api.post('/doctors/', payload);
      setShow(false); load();
    } catch (err) {
      const raw = err.response?.data;
      setError(raw && typeof raw === 'object'
        ? Object.values(raw).flat().join(' ')
        : 'Failed to save. Please try again.'
      );
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this doctor?')) return;
    try { await api.delete(`/doctors/${id}/`); load(); }
    catch { alert('Delete failed.'); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">All registered doctors — visible to all authenticated users.</p>
          <div className="flex gap-2 mt-2">
            <span className="summary-chip">Total: {doctors.length}</span>
            <span className="summary-chip">Availability status included</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={load}>Refresh</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
        </div>
      </div>

      {loadError && <div className="alert alert-error">{loadError}</div>}

      <div className="card filter-toolbar">
        <input
          className="form-control"
          placeholder="Search by doctor name, email, hospital, or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-control" value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}>
          <option value="all">All specializations</option>
          {SPECS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="form-control" value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option value="all">All availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
        <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name_asc">Sort: Name A-Z</option>
          <option value="name_desc">Sort: Name Z-A</option>
          <option value="exp_desc">Sort: Experience High-Low</option>
          <option value="fee_asc">Sort: Fee Low-High</option>
        </select>
      </div>

      {refreshing && <div className="text-sm text-muted" style={{ margin: '.2rem 0 .8rem' }}>Refreshing doctors list...</div>}

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : doctors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ fontSize: '3rem' }}>👨‍⚕️</div>
            <h3>No matching doctors found</h3>
            <p className="text-sm text-muted">Try changing search/filter options.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialisation</th>
                  <th>Hospital</th>
                  <th>Exp.</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="fw-700">Dr. {d.name}</div>
                      <div className="text-xs text-light">{d.email || '—'}</div>
                    </td>
                    <td><span className="badge badge-cyan">{d.specialization_display}</span></td>
                    <td className="text-sm">{d.hospital || '—'}</td>
                    <td className="text-sm">{d.experience_years} yr{d.experience_years !== 1 ? 's' : ''}</td>
                    <td>
                      {d.is_available
                        ? <span className="badge badge-green">Available</span>
                        : <span className="badge badge-red">Unavailable</span>}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn btn-secondary" style={{ padding: '.35rem .7rem', fontSize: '.8rem' }} onClick={() => openEdit(d)}>✏️ Edit</button>
                        <button className="btn btn-danger"    style={{ padding: '.35rem .7rem', fontSize: '.8rem' }} onClick={() => handleDelete(d.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit Doctor' : 'Add New Doctor'} onClose={() => setShow(false)}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" required value={form.name} onChange={f('name')} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label className="form-label">Specialisation</label>
                <select className="form-control" value={form.specialization} onChange={f('specialization')}>
                  {SPECS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email} onChange={f('email')} placeholder="doctor@hospital.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label className="form-label">Hospital / Clinic</label>
                <input className="form-control" value={form.hospital} onChange={f('hospital')} placeholder="AIIMS, Delhi" />
              </div>
              <div className="form-group">
                <label className="form-label">License Number</label>
                <input className="form-control" value={form.license_number} onChange={f('license_number')} placeholder="MCI-12345" />
              </div>
              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input type="number" min="0" className="form-control" value={form.experience_years} onChange={f('experience_years')} />
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input type="number" min="0" className="form-control" value={form.consultation_fee} onChange={f('consultation_fee')} placeholder="500" />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_available} onChange={fBool('is_available')} style={{ width: 18, height: 18 }} />
                <span className="font-600">Currently available for consultations</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Doctor'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
